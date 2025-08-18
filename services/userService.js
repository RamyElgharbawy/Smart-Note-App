const asyncHandler = require("express-async-handler");
const { sanitizeUser } = require("../utils/sanitizeData");
const userModel = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");

// @desc      Signup Service
// @route     POST /api/v1/user/signup
// @access    Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await userModel.create({
    email: req.body.email,
    password: req.body.password,
  });

  // 2- generate JWT
  const token = generateToken(user._id);

  res.status(201).json({ data: sanitizeUser(user), token });
});

// @desc      login Service
// @route     POST /api/v1/user/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- Find user in db
  const user = await userModel.findOne({
    email: req.body.email,
  });

  // 2- verify email & password
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Email or Password Incorrect", 401));
  }

  // 3- generate token
  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});
