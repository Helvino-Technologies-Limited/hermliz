const { Underwriter, Policy, Client } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

exports.getUnderwriters = async (req, res) => {
  const underwriters = await Underwriter.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  res.json({ success: true, data: underwriters });
};

exports.getUnderwriter = async (req, res) => {
  const uw = await Underwriter.findByPk(req.params.id);
  if (!uw) return res.status(404).json({ success: false, message: 'Underwriter not found.' });
  res.json({ success: true, data: uw });
};

exports.createUnderwriter = async (req, res) => {
  const uw = await Underwriter.create(req.body);
  res.status(201).json({ success: true, data: uw });
};

exports.updateUnderwriter = async (req, res) => {
  const uw = await Underwriter.findByPk(req.params.id);
  if (!uw) return res.status(404).json({ success: false, message: 'Underwriter not found.' });
  await uw.update(req.body);
  res.json({ success: true, data: uw });
};

exports.deleteUnderwriter = async (req, res) => {
  const uw = await Underwriter.findByPk(req.params.id);
  if (!uw) return res.status(404).json({ success: false, message: 'Underwriter not found.' });
  await uw.update({ isActive: false });
  res.json({ success: true, message: 'Underwriter archived.' });
};

exports.getUnderwriterStats = async (req, res) => {
  const { id } = req.params;
  const policies = await Policy.findAll({ where: { underwriterId: id } });
  const totalPremium = policies.reduce((s, p) => s + parseFloat(p.premiumAmount), 0);
  const totalCommission = policies.reduce((s, p) => s + parseFloat(p.commissionAmount), 0);
  const activePolicies = policies.filter(p => p.status === 'active').length;
  res.json({ success: true, data: { totalPolicies: policies.length, activePolicies, totalPremium, totalCommission } });
};
