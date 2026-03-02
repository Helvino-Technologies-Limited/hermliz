const { Op } = require('sequelize');
const { Client, Policy, Payment, Claim, Installment, Underwriter } = require('../models');

exports.getClients = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const where = { isActive: true };
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { nationalId: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { businessName: { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await Client.findAndCountAll({
    where,
    order: [['fullName', 'ASC']],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });
  res.json({ success: true, data: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
};

exports.getClient = async (req, res) => {
  const client = await Client.findByPk(req.params.id, {
    include: [
      {
        model: Policy, as: 'policies',
        include: [{ model: Underwriter, as: 'underwriter' }, { model: Installment, as: 'installments' }],
      },
      { model: Claim, as: 'claims' },
    ],
  });
  if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
  res.json({ success: true, data: client });
};

exports.createClient = async (req, res) => {
  const client = await Client.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: client });
};

exports.updateClient = async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
  await client.update(req.body);
  res.json({ success: true, data: client });
};

exports.deleteClient = async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
  await client.update({ isActive: false });
  res.json({ success: true, message: 'Client archived.' });
};

exports.searchByVehicle = async (req, res) => {
  const { reg } = req.params;
  const policies = await Policy.findAll({
    where: { vehicleReg: { [Op.like]: `%${reg}%` } },
    include: [{ model: Client, as: 'client' }],
  });
  res.json({ success: true, data: policies });
};

exports.getClientStats = async (req, res) => {
  const { id } = req.params;
  const policies = await Policy.findAll({ where: { clientId: id } });
  const totalPremium = policies.reduce((s, p) => s + parseFloat(p.premiumAmount), 0);
  const totalPaid = policies.reduce((s, p) => s + parseFloat(p.totalPaid), 0);
  const totalBalance = policies.reduce((s, p) => s + parseFloat(p.outstandingBalance), 0);
  const activePolicies = policies.filter(p => p.status === 'active').length;
  res.json({ success: true, data: { totalPolicies: policies.length, activePolicies, totalPremium, totalPaid, totalBalance } });
};
