const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated.' });

    const token = signToken(user.id);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, a reset code has been sent.',
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await user.update({
      resetPasswordToken: resetCode,
      resetPasswordExpires: resetExpires,
    });

    // Try to send email if configured
    try {
      const nodemailer = require('nodemailer');
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: `Hermliz IBMS <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Password Reset Code — Hermliz IBMS',
          html: `
            <div style="font-family: DM Sans, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <div style="background: #0f172a; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
                <div style="background: #1a56db; width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: 900; font-size: 14px;">HIA</span>
                </div>
                <h1 style="color: white; font-size: 22px; margin: 0;">Password Reset</h1>
              </div>
              <p style="color: #374151; font-size: 15px;">Hi ${user.name},</p>
              <p style="color: #374151; font-size: 15px;">Use this code to reset your password. It expires in <strong>30 minutes</strong>.</p>
              <div style="background: #ebf0ff; border: 2px dashed #1a56db; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Your reset code</p>
                <p style="color: #1a56db; font-size: 40px; font-weight: 900; letter-spacing: 8px; margin: 0; font-family: monospace;">${resetCode}</p>
              </div>
              <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, ignore this email. Your password won't change.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Hermliz Insurance Agency · Powered by Helvino Technologies</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
      // Don't fail — still return the code in dev
    }

    // In development or if email not configured, return code directly
    const isDev = process.env.NODE_ENV !== 'production' || !process.env.EMAIL_USER;
    res.json({
      success: true,
      message: 'If that email exists, a reset code has been sent.',
      ...(isDev && { devCode: resetCode, devNote: 'Code shown because email is not configured' }),
    });
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ success: false, message: 'Email, code and new password required.' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired code.' });

    if (user.resetPasswordToken !== code)
      return res.status(400).json({ success: false, message: 'Invalid reset code.' });

    if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires))
      return res.status(400).json({ success: false, message: 'Reset code has expired.' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('resetPassword error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.update({ name: req.body.name, phone: req.body.phone });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashed });
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    const user = await User.create({ name, email, phone, role, password });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.update(req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.update({ isActive: false });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
