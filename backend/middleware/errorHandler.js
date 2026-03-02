const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = Object.keys(err.fields)[0];
    error.message = `${field} already exists.`;
    return res.status(400).json({ success: false, message: error.message });
  }
  if (err.name === 'SequelizeValidationError') {
    error.message = err.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: error.message });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
