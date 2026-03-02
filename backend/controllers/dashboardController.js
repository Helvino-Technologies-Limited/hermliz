const moment = require('moment');
const { Op } = require('sequelize');
const { Policy, Client, Installment, Payment, Claim, Underwriter } = require('../models');

exports.getDashboard = async (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  const in7 = moment().add(7, 'days').format('YYYY-MM-DD');
  const in14 = moment().add(14, 'days').format('YYYY-MM-DD');
  const in30 = moment().add(30, 'days').format('YYYY-MM-DD');
  const monthStart = moment().startOf('month').format('YYYY-MM-DD');
  const monthEnd = moment().endOf('month').format('YYYY-MM-DD');

  const [
    totalClients, totalPolicies, activePolicies,
    expiring7, expiring14, expiring30,
    overdueInstallments, dueTodayInstallments,
    openClaims, monthPayments,
  ] = await Promise.all([
    Client.count({ where: { isActive: true } }),
    Policy.count(),
    Policy.count({ where: { status: 'active' } }),
    Policy.count({ where: { endDate: { [Op.between]: [today, in7] }, status: 'active' } }),
    Policy.count({ where: { endDate: { [Op.between]: [today, in14] }, status: 'active' } }),
    Policy.count({ where: { endDate: { [Op.between]: [today, in30] }, status: 'active' } }),
    Installment.count({ where: { dueDate: { [Op.lt]: today }, status: { [Op.in]: ['pending', 'partial'] } } }),
    Installment.count({ where: { dueDate: today, status: { [Op.in]: ['pending', 'partial'] } } }),
    Claim.count({ where: { status: { [Op.in]: ['reported', 'under_review'] } } }),
    Payment.findAll({ where: { paymentDate: { [Op.between]: [monthStart, monthEnd] } } }),
  ]);

  const monthlyRevenue = monthPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const allPolicies = await Policy.findAll({ where: { status: 'active' } });
  const totalOutstanding = allPolicies.reduce((s, p) => s + parseFloat(p.outstandingBalance), 0);
  const totalCommission = allPolicies.reduce((s, p) => s + parseFloat(p.commissionAmount), 0);

  const recentPayments = await Payment.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
  });

  const expiringPolicies = await Policy.findAll({
    where: { endDate: { [Op.between]: [today, in30] }, status: 'active' },
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
    order: [['endDate', 'ASC']],
    limit: 10,
  });

  const overdueList = await Installment.findAll({
    where: { dueDate: { [Op.lt]: today }, status: { [Op.in]: ['pending', 'partial'] } },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
    order: [['dueDate', 'ASC']],
    limit: 10,
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalClients, totalPolicies, activePolicies,
        expiring7, expiring14, expiring30,
        overdueInstallments, dueTodayInstallments,
        openClaims, monthlyRevenue, totalOutstanding, totalCommission,
      },
      recentPayments,
      expiringPolicies,
      overdueInstallments: overdueList,
    },
  });
};

exports.getRevenueChart = async (req, res) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const start = moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD');
    const end = moment().subtract(i, 'months').endOf('month').format('YYYY-MM-DD');
    const payments = await Payment.findAll({ where: { paymentDate: { [Op.between]: [start, end] } } });
    const total = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    months.push({ month: moment().subtract(i, 'months').format('MMM YYYY'), revenue: total });
  }
  res.json({ success: true, data: months });
};

exports.getUnderwriterBreakdown = async (req, res) => {
  const underwriters = await Underwriter.findAll({ where: { isActive: true } });
  const breakdown = await Promise.all(underwriters.map(async (uw) => {
    const policies = await Policy.findAll({ where: { underwriterId: uw.id, status: 'active' } });
    const totalPremium = policies.reduce((s, p) => s + parseFloat(p.premiumAmount), 0);
    return { underwriter: uw.name, policies: policies.length, totalPremium };
  }));
  res.json({ success: true, data: breakdown.filter(b => b.policies > 0) });
};
