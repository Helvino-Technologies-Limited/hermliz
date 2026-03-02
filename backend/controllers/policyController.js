const moment = require('moment');
const { Op } = require('sequelize');
const { Policy, Client, Underwriter, Installment, Payment, Notification } = require('../models');
const generatePolicyNumber = require('../utils/policyNumber');
const generateInstallments = require('../utils/installmentGenerator');

exports.getPolicies = async (req, res) => {
  const { search, status, insuranceClass, underwriterId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (insuranceClass) where.insuranceClass = insuranceClass;
  if (underwriterId) where.underwriterId = underwriterId;

  const { count, rows } = await Policy.findAndCountAll({
    where,
    include: [
      { model: Client, as: 'client' },
      { model: Underwriter, as: 'underwriter' },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });
  res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
};

exports.getPolicy = async (req, res) => {
  const policy = await Policy.findByPk(req.params.id, {
    include: [
      { model: Client, as: 'client' },
      { model: Underwriter, as: 'underwriter' },
      { model: Installment, as: 'installments', include: [{ model: Payment, as: 'payments' }] },
    ],
  });
  if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
  res.json({ success: true, data: policy });
};

exports.createPolicy = async (req, res) => {
  const policyNumber = await generatePolicyNumber(req.body.insuranceClass);
  const commissionAmount = (parseFloat(req.body.premiumAmount) * parseFloat(req.body.commissionPercent || 0)) / 100;

  const policy = await Policy.create({
    ...req.body,
    policyNumber,
    commissionAmount,
    outstandingBalance: parseFloat(req.body.premiumAmount),
    createdBy: req.user.id,
  });

  const installments = generateInstallments(policy);
  await Installment.bulkCreate(installments);

  await Notification.create({
    clientId: policy.clientId,
    policyId: policy.id,
    type: 'policy_created',
    title: 'New Policy Created',
    message: `Policy ${policyNumber} has been created successfully.`,
    channel: 'in_app',
    status: 'sent',
    sentAt: new Date(),
  });

  const created = await Policy.findByPk(policy.id, {
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }, { model: Installment, as: 'installments' }],
  });

  res.status(201).json({ success: true, data: created });
};

exports.updatePolicy = async (req, res) => {
  const policy = await Policy.findByPk(req.params.id);
  if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
  if (req.body.premiumAmount || req.body.commissionPercent) {
    const premium = parseFloat(req.body.premiumAmount || policy.premiumAmount);
    const commPct = parseFloat(req.body.commissionPercent || policy.commissionPercent);
    req.body.commissionAmount = (premium * commPct) / 100;
  }
  await policy.update(req.body);
  res.json({ success: true, data: policy });
};

exports.deletePolicy = async (req, res) => {
  const policy = await Policy.findByPk(req.params.id);
  if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
  await policy.update({ status: 'cancelled' });
  res.json({ success: true, message: 'Policy cancelled.' });
};

exports.renewPolicy = async (req, res) => {
  const original = await Policy.findByPk(req.params.id);
  if (!original) return res.status(404).json({ success: false, message: 'Policy not found.' });

  const policyNumber = await generatePolicyNumber(original.insuranceClass);
  const { startDate, endDate, premiumAmount, commissionPercent } = req.body;
  const commissionAmount = (parseFloat(premiumAmount) * parseFloat(commissionPercent)) / 100;

  const renewed = await Policy.create({
    clientId: original.clientId,
    underwriterId: original.underwriterId,
    insuranceClass: original.insuranceClass,
    vehicleReg: original.vehicleReg,
    policyNumber,
    startDate,
    endDate,
    premiumAmount,
    commissionPercent,
    commissionAmount,
    outstandingBalance: parseFloat(premiumAmount),
    paymentPlan: req.body.paymentPlan || original.paymentPlan,
    renewalReminderDays: original.renewalReminderDays,
    isRenewal: true,
    parentPolicyId: original.id,
    status: 'active',
    createdBy: req.user.id,
  });

  await original.update({ status: 'renewed', renewalStatus: 'renewed' });
  const installments = generateInstallments(renewed);
  await Installment.bulkCreate(installments);

  res.status(201).json({ success: true, data: renewed, message: 'Policy renewed successfully.' });
};

exports.getExpiringPolicies = async (req, res) => {
  const { days = 30 } = req.query;
  const today = moment().format('YYYY-MM-DD');
  const future = moment().add(parseInt(days), 'days').format('YYYY-MM-DD');
  const policies = await Policy.findAll({
    where: { endDate: { [Op.between]: [today, future] }, status: 'active' },
    include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
    order: [['endDate', 'ASC']],
  });
  res.json({ success: true, data: policies });
};

exports.updateRenewalStatus = async (req, res) => {
  const policy = await Policy.findByPk(req.params.id);
  if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
  await policy.update({ renewalStatus: req.body.renewalStatus });
  res.json({ success: true, data: policy });
};
