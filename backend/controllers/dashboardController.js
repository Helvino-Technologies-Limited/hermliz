const { Op } = require('sequelize');
const moment = require('moment');
const { Policy, Client, Installment, Payment, Underwriter, Claim } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const in7 = moment().add(7, 'days').format('YYYY-MM-DD');
    const in30 = moment().add(30, 'days').format('YYYY-MM-DD');

    const [
      totalClients,
      activePolicies,
      expiringIn7,
      expiringIn30,
      overdueInstallments,
      dueTodayInstallments,
      totalOutstandingResult,
      totalCommissionResult,
      totalPremiumResult,
    ] = await Promise.all([
      Client.count({ where: { isActive: true } }),
      Policy.count({ where: { status: 'active' } }),
      Policy.count({ where: { status: 'active', endDate: { [Op.between]: [today, in7] } } }),
      Policy.count({ where: { status: 'active', endDate: { [Op.between]: [today, in30] } } }),
      Installment.count({ where: { status: 'overdue' } }),
      Installment.count({ where: { status: { [Op.in]: ['pending', 'partial'] }, dueDate: today } }),
      Installment.sum('amountDue', { where: { status: { [Op.in]: ['pending', 'partial', 'overdue'] } } }),
      Policy.sum('commissionAmount', { where: { status: { [Op.in]: ['active', 'renewed'] } } }),
      Policy.sum('premiumAmount', { where: { status: 'active' } }),
    ]);

    // Monthly revenue — last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const start = moment().subtract(i, 'months').startOf('month').toDate();
      const end = moment().subtract(i, 'months').endOf('month').toDate();
      const revenue = await Payment.sum('amount', {
        where: { paymentDate: { [Op.between]: [start, end] } },
      });
      monthlyRevenue.push({
        month: moment().subtract(i, 'months').format('MMM'),
        revenue: parseFloat(revenue || 0),
      });
    }

    // Underwriter breakdown
    const underwriters = await Underwriter.findAll({ where: { isActive: true } });
    const underwriterBreakdown = await Promise.all(
      underwriters.map(async (uw) => {
        const count = await Policy.count({ where: { underwriterId: uw.id, status: 'active' } });
        const premium = await Policy.sum('premiumAmount', { where: { underwriterId: uw.id, status: 'active' } });
        return {
          name: uw.shortName,
          policies: count,
          premium: parseFloat(premium || 0),
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalClients: totalClients || 0,
        activePolicies: activePolicies || 0,
        expiringIn7: expiringIn7 || 0,
        expiringIn30: expiringIn30 || 0,
        overdueInstallments: overdueInstallments || 0,
        dueToday: dueTodayInstallments || 0,
        totalOutstanding: parseFloat(totalOutstandingResult || 0),
        totalCommission: parseFloat(totalCommissionResult || 0),
        totalPremium: parseFloat(totalPremiumResult || 0),
        monthlyRevenue,
        underwriterBreakdown,
      },
    });
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const months = parseInt(req.query.months || '6');
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = moment().subtract(i, 'months').startOf('month').toDate();
      const end = moment().subtract(i, 'months').endOf('month').toDate();
      const revenue = await Payment.sum('amount', {
        where: { paymentDate: { [Op.between]: [start, end] } },
      });
      const commission = await Policy.sum('commissionAmount', {
        where: { createdAt: { [Op.between]: [start, end] } },
      });
      data.push({
        month: moment().subtract(i, 'months').format('MMM YY'),
        revenue: parseFloat(revenue || 0),
        commission: parseFloat(commission || 0),
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUnderwriterBreakdown = async (req, res) => {
  try {
    const underwriters = await Underwriter.findAll({ where: { isActive: true } });
    const breakdown = await Promise.all(
      underwriters.map(async (uw) => {
        const activePolicies = await Policy.count({ where: { underwriterId: uw.id, status: 'active' } });
        const totalPremium = await Policy.sum('premiumAmount', { where: { underwriterId: uw.id } });
        const totalCommission = await Policy.sum('commissionAmount', { where: { underwriterId: uw.id } });
        return {
          id: uw.id,
          name: uw.name,
          shortName: uw.shortName,
          activePolicies,
          totalPremium: parseFloat(totalPremium || 0),
          totalCommission: parseFloat(totalCommission || 0),
        };
      })
    );
    res.json({ success: true, data: breakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
