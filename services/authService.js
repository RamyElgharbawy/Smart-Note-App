const asyncHandler = require("express-async-handler");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const TokenBlacklist = require("../models/tokenBlacklistModel");
const sendEmail = require("../utils/sendMail");

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

// @desc      Forgot Password Service
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- Verify user.
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user for this email: ${req.body.email}`, 404)
    );
  }

  // 2- generate reset code with random 6 digits and save it to db.
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // save hashed reset code into db
  user.passwordResetCode = hashedResetCode;
  // create reset code expire time into db
  user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;

  // save user data into db
  await user.save();

  // 3- send reset code via email.
  const massage = `Hi ${user.email}\n
        We Received Request to reset your Smart Note App account password\n
        Enter the following code to reset your password.\n
        ${resetCode}\n
        Thanks to helping us to keep your account secure.\n
        Support Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid for 10 min)",
      massage,
    });
  } catch (error) {
    // reset fields in db when mail not sent
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return next(new ApiError("There is an Error in sending mail", 500));
  }

  res
    .status(200)
    .json({ status: "Success", massage: "Reset code sent to your email" });
});

// @desc      Reset Password
// @route     POST /api/v1/auth/resetPassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- hash reset code from body to compare with another in db
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // 2- get user by reset code
  const user = await userModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or Expired Reset code", 500));
  }

  // 3- reset password & save it in db
  user.password = req.body.newPassword;
  await user.save();

  // 4- reset password fields in db
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;

  await user.save();

  res
    .status(200)
    .json({ status: "Success", message: "User password changed Successfully" });
});
