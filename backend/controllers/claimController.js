const { Claim, Policy, Client, Underwriter } = require('../models');

const padNum = (n) => String(n).padStart(5, '0');

exports.getClaims = async (req, res) => {
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
    offset: (page - 1) * limit,
  });
  res.json({ success: true, data: rows, total: count, pages: Math.ceil(count / limit) });
};

exports.getClaim = async (req, res) => {
  const claim = await Claim.findByPk(req.params.id, {
    include: [{ model: Policy, as: 'policy' }, { model: Client, as: 'client' }, { model: Underwriter, as: 'underwriter' }],
  });
  if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });
  res.json({ success: true, data: claim });
};

exports.createClaim = async (req, res) => {
  const count = await Claim.count();
  const claimNumber = `CLM-${new Date().getFullYear()}-${padNum(count + 1)}`;
  const policy = await Policy.findByPk(req.body.policyId);
  if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
  const claim = await Claim.create({
    ...req.body,
    claimNumber,
    clientId: policy.clientId,
    underwriterId: policy.underwriterId,
    handledBy: req.user.id,
  });
  res.status(201).json({ success: true, data: claim });
};

exports.updateClaim = async (req, res) => {
  const claim = await Claim.findByPk(req.params.id);
  if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });
  await claim.update(req.body);
  res.json({ success: true, data: claim });
};
