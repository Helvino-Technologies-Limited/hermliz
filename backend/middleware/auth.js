const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: 'Not authorized. Token invalid or expired.' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'isActive'],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};
