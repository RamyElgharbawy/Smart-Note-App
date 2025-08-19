const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const TokenBlacklist = require("../models/tokenBlacklistModel");

// @desc  Authentication service Middleware [protected route]
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if there is token & if exist get it.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("Please login to access this recourse", 401));
  }

  // 2- Check if token is blacklisted
  const blacklisted = await TokenBlacklist.findOne({ token });
  if (blacklisted) {
    return next(new ApiError("Token revoked", 401));
  }

  // 3- verify token (no changes happened, expired time).
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 4- verify user if exist.
  const currentUser = await userModel.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError("This user doesn`t exist", 401));
  }

  // 5- check user password if changed after token created.
  if (currentUser.passwordChangedAt) {
    // convert changed password time format to timestamp format
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passwordChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User has recently changed password, please login again",
          401
        )
      );
    }
  }

  // inject current user into request
  req.user = currentUser;

  next();
});
