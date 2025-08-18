const ApiError = require("../utils/ApiError");

// @desc    error schema for development
const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
// @desc    error schema for Production
const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

// @desc    global error handling middleware
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
