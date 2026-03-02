const { User } = require('../models');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Account deactivated.' });

  await user.update({ lastLogin: new Date() });
  res.json({ success: true, token: generateToken(user.id), user });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, email } = req.body;
  await req.user.update({ name, phone, email });
  res.json({ success: true, user: req.user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!(await req.user.comparePassword(currentPassword)))
    return res.status(400).json({ success: false, message: 'Current password incorrect.' });
  await req.user.update({ password: newPassword });
  res.json({ success: true, message: 'Password changed successfully.' });
};

exports.getUsers = async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: users });
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
};

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  await user.update(req.body);
  res.json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  await user.update({ isActive: false });
  res.json({ success: true, message: 'User deactivated.' });
};
