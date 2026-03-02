const moment = require('moment');
const { Op } = require('sequelize');
const { Policy, Client, Payment, Installment, Underwriter, Claim } = require('../models');

exports.getPolicyRegister = async (req, res) => {
  const { startDate, endDate, underwriterId, insuranceClass, status } = req.query;
  const where = {};
  if (status) where.status = status;
  if (insuranceClass) where.insuranceClass = insuranceClass;
  if (underwriterId) where.underwriterId = underwriterId;
  if (startDate && endDate) where.startDate = { [Op.between]: [startDate, endDate] };

  const policies = await Policy.findAll({
    where,
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: policies });
};

exports.getCommissionReport = async (req, res) => {
  const { startDate, endDate, underwriterId } = req.query;
  const where = {};
  if (underwriterId) where.underwriterId = underwriterId;
  if (startDate && endDate) where.startDate = { [Op.between]: [startDate, endDate] };

  const policies = await Policy.findAll({
    where,
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
  });

  const totalCommission = policies.reduce((s, p) => s + parseFloat(p.commissionAmount), 0);
  const totalPremium = policies.reduce((s, p) => s + parseFloat(p.premiumAmount), 0);

  res.json({ success: true, data: { policies, totalCommission, totalPremium } });
};

exports.getDebtReport = async (req, res) => {
  const policies = await Policy.findAll({
    where: { outstandingBalance: { [Op.gt]: 0 } },
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
    order: [['outstandingBalance', 'DESC']],
  });
  const totalDebt = policies.reduce((s, p) => s + parseFloat(p.outstandingBalance), 0);
  res.json({ success: true, data: { policies, totalDebt } });
};

exports.getAgingReport = async (req, res) => {
  const today = moment();
  const overdue30 = await Installment.findAll({
    where: {
      dueDate: { [Op.lt]: today.clone().subtract(30, 'days').format('YYYY-MM-DD') },
      status: { [Op.in]: ['pending', 'partial'] },
    },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
  });
  const overdue60 = await Installment.findAll({
    where: {
      dueDate: {
        [Op.between]: [
          today.clone().subtract(60, 'days').format('YYYY-MM-DD'),
          today.clone().subtract(31, 'days').format('YYYY-MM-DD'),
        ],
      },
      status: { [Op.in]: ['pending', 'partial'] },
    },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
  });
  res.json({ success: true, data: { overdue30, overdue60 } });
};

exports.getRenewalForecast = async (req, res) => {
  const { days = 60 } = req.query;
  const today = moment().format('YYYY-MM-DD');
  const future = moment().add(parseInt(days), 'days').format('YYYY-MM-DD');
  const policies = await Policy.findAll({
    where: { endDate: { [Op.between]: [today, future] }, status: 'active' },
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
    order: [['endDate', 'ASC']],
  });
  const totalPremiumAtRisk = policies.reduce((s, p) => s + parseFloat(p.premiumAmount), 0);
  res.json({ success: true, data: { policies, totalPolicies: policies.length, totalPremiumAtRisk } });
};

exports.getIncomeReport = async (req, res) => {
  const { month, year } = req.query;
  const m = month || moment().month() + 1;
  const y = year || moment().year();
  const start = moment(`${y}-${m}-01`).startOf('month').format('YYYY-MM-DD');
  const end = moment(`${y}-${m}-01`).endOf('month').format('YYYY-MM-DD');

  const payments = await Payment.findAll({
    where: { paymentDate: { [Op.between]: [start, end] } },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
    order: [['paymentDate', 'ASC']],
  });
  const total = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  res.json({ success: true, data: { payments, total, period: `${start} to ${end}` } });
};
