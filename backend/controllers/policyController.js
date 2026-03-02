const moment = require('moment');
const { Op } = require('sequelize');
const { Policy, Client, Underwriter, Installment, Payment, Notification } = require('../models');
const generatePolicyNumber = require('../utils/policyNumber');
const generateInstallments = require('../utils/installmentGenerator');

// Helper: convert empty string to null
const nullIfEmpty = (val) => (val === '' || val === undefined) ? null : val;

exports.getPolicies = async (req, res) => {
  try {
    const { status, insuranceClass, underwriterId, page = 1, limit = 20 } = req.query;
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
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
  } catch (err) {
    console.error('getPolicies error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Underwriter, as: 'underwriter' },
        { model: Installment, as: 'installments', include: [{ model: Payment, as: 'payments' }] },
      ],
    });
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const {
      clientId, underwriterId, insuranceClass, premiumAmount,
      commissionPercent, sumInsured, startDate, endDate,
      paymentPlan, renewalReminderDays, vehicleReg, vehicleMake,
      vehicleModel, notes,
    } = req.body;

    // Validate required UUID fields
    if (!clientId || clientId.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select a client.' });
    }
    if (!underwriterId || underwriterId.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select an underwriter.' });
    }
    if (!premiumAmount || isNaN(parseFloat(premiumAmount))) {
      return res.status(400).json({ success: false, message: 'Premium amount is required.' });
    }

    const policyNumber = await generatePolicyNumber(insuranceClass);
    const commAmt = (parseFloat(premiumAmount) * parseFloat(commissionPercent || 0)) / 100;

    const policy = await Policy.create({
      clientId: clientId.trim(),
      underwriterId: underwriterId.trim(),
      insuranceClass,
      premiumAmount: parseFloat(premiumAmount),
      commissionPercent: parseFloat(commissionPercent || 0),
      commissionAmount: commAmt,
      sumInsured: nullIfEmpty(sumInsured) ? parseFloat(sumInsured) : null,
      startDate,
      endDate,
      paymentPlan: paymentPlan || 'full',
      renewalReminderDays: parseInt(renewalReminderDays || 30),
      vehicleReg: nullIfEmpty(vehicleReg),
      vehicleMake: nullIfEmpty(vehicleMake),
      vehicleModel: nullIfEmpty(vehicleModel),
      notes: nullIfEmpty(notes),
      outstandingBalance: parseFloat(premiumAmount),
      policyNumber,
      status: 'active',
      isRenewal: false,
      createdBy: req.user.id,
    });

    const installments = generateInstallments(policy);
    await Installment.bulkCreate(installments);

    await Notification.create({
      clientId: policy.clientId,
      policyId: policy.id,
      type: 'policy_created',
      title: 'New Policy Created',
      message: `Policy ${policyNumber} created successfully.`,
      channel: 'in_app',
      status: 'sent',
      sentAt: new Date(),
    });

    const created = await Policy.findByPk(policy.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Underwriter, as: 'underwriter' },
        { model: Installment, as: 'installments' },
      ],
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('createPolicy error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
    if (req.body.premiumAmount || req.body.commissionPercent) {
      const premium = parseFloat(req.body.premiumAmount || policy.premiumAmount);
      const commPct = parseFloat(req.body.commissionPercent || policy.commissionPercent);
      req.body.commissionAmount = (premium * commPct) / 100;
    }
    await policy.update(req.body);
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
    await policy.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Policy cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.renewPolicy = async (req, res) => {
  try {
    const original = await Policy.findByPk(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Policy not found.' });

    const policyNumber = await generatePolicyNumber(original.insuranceClass);
    const { startDate, endDate, premiumAmount, commissionPercent, paymentPlan } = req.body;
    const commissionAmount = (parseFloat(premiumAmount) * parseFloat(commissionPercent || 0)) / 100;

    const renewed = await Policy.create({
      clientId: original.clientId,
      underwriterId: original.underwriterId,
      insuranceClass: original.insuranceClass,
      vehicleReg: original.vehicleReg,
      policyNumber,
      startDate,
      endDate,
      premiumAmount: parseFloat(premiumAmount),
      commissionPercent: parseFloat(commissionPercent || 0),
      commissionAmount,
      outstandingBalance: parseFloat(premiumAmount),
      paymentPlan: paymentPlan || original.paymentPlan,
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
  } catch (err) {
    console.error('renewPolicy error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpiringPolicies = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = moment().format('YYYY-MM-DD');
    const future = moment().add(parseInt(days), 'days').format('YYYY-MM-DD');
    const policies = await Policy.findAll({
      where: { endDate: { [Op.between]: [today, future] }, status: 'active' },
      include: [{ model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
      order: [['endDate', 'ASC']],
    });
    res.json({ success: true, data: policies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRenewalStatus = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
    await policy.update({ renewalStatus: req.body.renewalStatus });
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
