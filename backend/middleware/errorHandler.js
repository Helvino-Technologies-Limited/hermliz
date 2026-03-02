const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: err.errors.map(e => e.message).join(', '),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'A record with that value already exists.',
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      success: false,
      message: 'Database error: ' + err.message,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
};

module.exports = errorHandler;
