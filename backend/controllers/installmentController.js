const moment = require('moment');
const { Op } = require('sequelize');
const { Installment, Payment, Policy, Client } = require('../models');

exports.getInstallments = async (req, res) => {
  const { status, overdue, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (overdue === 'true') {
    where.dueDate = { [Op.lt]: moment().format('YYYY-MM-DD') };
    where.status = { [Op.in]: ['pending', 'partial'] };
  }
  const { count, rows } = await Installment.findAndCountAll({
    where,
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
    order: [['dueDate', 'ASC']],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });
  res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
};

exports.recordPayment = async (req, res) => {
  const installment = await Installment.findByPk(req.params.id, {
    include: [{ model: Policy, as: 'policy' }],
  });
  if (!installment) return res.status(404).json({ success: false, message: 'Installment not found.' });

  const { amount, paymentDate, paymentMethod, transactionRef, receiptNumber, notes } = req.body;
  const paidAmount = parseFloat(installment.amountPaid) + parseFloat(amount);

  const payment = await Payment.create({
    installmentId: installment.id,
    policyId: installment.policyId,
    clientId: installment.policy.clientId,
    amount: parseFloat(amount),
    paymentDate,
    paymentMethod,
    transactionRef,
    receiptNumber,
    recordedBy: req.user.id,
    notes,
  });

  let newStatus = 'partial';
  if (paidAmount >= parseFloat(installment.amountDue)) newStatus = 'paid';

  await installment.update({ amountPaid: paidAmount, status: newStatus, paidDate: newStatus === 'paid' ? paymentDate : null });

  const policy = await Policy.findByPk(installment.policyId);
  const newTotalPaid = parseFloat(policy.totalPaid) + parseFloat(amount);
  const newBalance = parseFloat(policy.premiumAmount) - newTotalPaid;
  await policy.update({ totalPaid: newTotalPaid, outstandingBalance: Math.max(0, newBalance) });

  res.json({ success: true, data: payment, message: 'Payment recorded successfully.' });
};

exports.getDueToday = async (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  const installments = await Installment.findAll({
    where: { dueDate: today, status: { [Op.in]: ['pending', 'partial'] } },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
  });
  res.json({ success: true, data: installments });
};

exports.getOverdue = async (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  const installments = await Installment.findAll({
    where: {
      dueDate: { [Op.lt]: today },
      status: { [Op.in]: ['pending', 'partial'] },
    },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
    order: [['dueDate', 'ASC']],
  });
  res.json({ success: true, data: installments });
};
