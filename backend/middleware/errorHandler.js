const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = { statusCode: 404, message: 'Resource not found' };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { statusCode: 400, message: `${field} already exists` };
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = { statusCode: 400, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
