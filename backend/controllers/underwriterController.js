const { Underwriter, Policy, Client } = require('../models');

const nullIfEmpty = (val) => (val === '' || val === undefined || val === null) ? null : val;
const numOrNull = (val) => (val === '' || val === undefined || val === null || isNaN(parseFloat(val))) ? null : parseFloat(val);

exports.getUnderwriters = async (req, res) => {
  try {
    const underwriters = await Underwriter.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: underwriters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUnderwriter = async (req, res) => {
  try {
    const uw = await Underwriter.findByPk(req.params.id);
    if (!uw) return res.status(404).json({ success: false, message: 'Underwriter not found.' });
    res.json({ success: true, data: uw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUnderwriter = async (req, res) => {
  try {
    const {
      name, shortName, contactPerson, contactPhone, contactEmail,
      address, website, defaultCommissionRate,
      motorCommission, medicalCommission, lifeCommission, notes,
    } = req.body;

    if (!name || !shortName) {
      return res.status(400).json({ success: false, message: 'Name and Short Name are required.' });
    }

    const uw = await Underwriter.create({
      name,
      shortName,
      contactPerson: nullIfEmpty(contactPerson),
      contactPhone: nullIfEmpty(contactPhone),
      contactEmail: nullIfEmpty(contactEmail),
      address: nullIfEmpty(address),
      website: nullIfEmpty(website),
      defaultCommissionRate: numOrNull(defaultCommissionRate) ?? 10,
      motorCommission: numOrNull(motorCommission),
      medicalCommission: numOrNull(medicalCommission),
      lifeCommission: numOrNull(lifeCommission),
      notes: nullIfEmpty(notes),
    });

    res.status(201).json({ success: true, data: uw });
  } catch (err) {
    console.error('createUnderwriter error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUnderwriter = async (req, res) => {
  try {
    const uw = await Underwriter.findByPk(req.params.id);
    if (!uw) return res.status(404).json({ success: false, message: 'Underwriter not found.' });

    const {
      name, shortName, contactPerson, contactPhone, contactEmail,
      address, website, defaultCommissionRate,
      motorCommission, medicalCommission, lifeCommission, notes,
    } = req.body;

    await uw.update({
      name,
      shortName,
      contactPerson: nullIfEmpty(contactPerson),
      contactPhone: nullIfEmpty(contactPhone),
      contactEmail: nullIfEmpty(contactEmail),
      address: nullIfEmpty(address),
      website: nullIfEmpty(website),
      defaultCommissionRate: numOrNull(defaultCommissionRate) ?? uw.defaultCommissionRate,
      motorCommission: numOrNull(motorCommission),
      medicalCommission: numOrNull(medicalCommission),
      lifeCommission: numOrNull(lifeCommission),
      notes: nullIfEmpty(notes),
    });

    res.json({ success: true, data: uw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUnderwriter = async (req, res) => {
  try {
    const uw = await Underwriter.findByPk(req.params.id);
    if (!uw) return res.status(404).json({ success: false, message: 'Underwriter not found.' });
    await uw.update({ isActive: false });
    res.json({ success: true, message: 'Underwriter archived.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUnderwriterStats = async (req, res) => {
  try {
    const { id } = req.params;
    const policies = await Policy.findAll({ where: { underwriterId: id } });
    const totalPremium = policies.reduce((s, p) => s + parseFloat(p.premiumAmount || 0), 0);
    const totalCommission = policies.reduce((s, p) => s + parseFloat(p.commissionAmount || 0), 0);
    const activePolicies = policies.filter(p => p.status === 'active').length;
    res.json({
      success: true,
      data: { totalPolicies: policies.length, activePolicies, totalPremium, totalCommission },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
