const { Claim, Policy, Client, Underwriter } = require('../models');

const nullIfEmpty = (val) => (val === '' || val === undefined || val === null) ? null : val;
const numOrNull = (val) => (val === '' || val === undefined || val === null || isNaN(parseFloat(val))) ? null : parseFloat(val);

const padNum = (n) => String(n).padStart(5, '0');

exports.getClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await Claim.findAndCountAll({
      where,
      include: [
        { model: Policy, as: 'policy' },
        { model: Client, as: 'client' },
        { model: Underwriter, as: 'underwriter' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClaim = async (req, res) => {
  try {
    const claim = await Claim.findByPk(req.params.id, {
      include: [
        { model: Policy, as: 'policy' },
        { model: Client, as: 'client' },
        { model: Underwriter, as: 'underwriter' },
      ],
    });
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });
    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClaim = async (req, res) => {
  try {
    const { policyId, incidentDate, reportedDate, claimAmount, description, nextFollowUpDate, notes } = req.body;

    if (!policyId || policyId.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please select a policy.' });
    }

    const policy = await Policy.findByPk(policyId.trim());
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });

    const count = await Claim.count();
    const claimNumber = `CLM-${new Date().getFullYear()}-${padNum(count + 1)}`;

    const claim = await Claim.create({
      policyId: policyId.trim(),
      clientId: policy.clientId,
      underwriterId: policy.underwriterId,
      claimNumber,
      incidentDate: nullIfEmpty(incidentDate),
      reportedDate: nullIfEmpty(reportedDate),
      claimAmount: numOrNull(claimAmount),
      description: nullIfEmpty(description),
      nextFollowUpDate: nullIfEmpty(nextFollowUpDate),
      notes: nullIfEmpty(notes),
      status: 'reported',
      handledBy: req.user.id,
    });

    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    console.error('createClaim error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findByPk(req.params.id);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

    const { incidentDate, reportedDate, claimAmount, approvedAmount, paidAmount, description, nextFollowUpDate, status, notes } = req.body;

    await claim.update({
      incidentDate: nullIfEmpty(incidentDate),
      reportedDate: nullIfEmpty(reportedDate),
      claimAmount: numOrNull(claimAmount),
      approvedAmount: numOrNull(approvedAmount),
      paidAmount: numOrNull(paidAmount),
      description: nullIfEmpty(description),
      nextFollowUpDate: nullIfEmpty(nextFollowUpDate),
      status: status || claim.status,
      notes: nullIfEmpty(notes),
    });

    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
