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

// handle jwt invalid signature error method
const handleJwtInvalidSignature = () => new ApiError(`Invalid token `, 401);

// handle jwt expired token error method
const handleJwtExpiredToken = () => new ApiError(`Expired token `, 401);

// handle jwt malformed token error method
const handleJwtMalformedToken = () =>
  new ApiError(`Incorrect token , Try again`, 401);

// @desc    global error handling middleware
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Internal server error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.message === "invalid signature") err = handleJwtInvalidSignature();
    if (err.message === "jwt malformed") err = handleJwtMalformedToken();
    if (err.message === "jwt expired") err = handleJwtExpiredToken();

    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
