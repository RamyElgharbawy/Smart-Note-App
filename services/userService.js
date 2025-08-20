const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const { sanitizeUser } = require("../utils/sanitizeData");
const userModel = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const TokenBlacklist = require("../models/tokenBlacklistModel");

// @desc      Signup Service
// @route     POST /api/v1/user/signup
// @access    Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await userModel.create({
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({ data: sanitizeUser(user) });
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

  res.status(200).json({ data: sanitizeUser(user), token });
});

// @desc      Change User Image Service
// @route     PATCH /api/v1/user/profileImage
// @access    Private - Protected
exports.changeProfileImage = asyncHandler(async (req, res, next) => {
  // 1- find user
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new ApiError(`No User For This id:${req.user._id}`, 404));
  }

  // 2- Check if file was uploaded
  if (!req.file) {
    return next(new ApiError("No image file provided", 404));
  }
  // 3- Delete old profile image if it exists
  if (user.profileImage) {
    const oldImagePath = path.join(__dirname, "..", user.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // 4- Create the image URL (relative path)
  const imageUrl = `uploads/profile-images/${req.file.filename}`;

  // 5- Update user profile image in database
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: imageUrl,
    },
    { new: true, select: "-password" }
  );

  // If there's an error, delete the uploaded file
  if (!updatedUser) {
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads/profile-images",
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully",
    data: {
      user: updatedUser,
      imageUrl: `${req.protocol}://${req.get("host")}/${imageUrl}`,
    },
  });
});

// @desc      Logout Service
// @route     POST /api/v1/user/logout
// @access    Private - Protected
exports.logout = asyncHandler(async (req, res, next) => {
  // 1- get token from current user
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("No token provided", 401));
  }

  // 2- decode the token to get expiration
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3- add token to blacklist
  const blackListedToken = await TokenBlacklist.create({
    token: token,
    expiresAt: new Date(decoded.exp * 1000),
  });

  if (!blackListedToken) {
    return next(new ApiError("Logout error", 500));
  }

  res.status(200).json({
    success: true,
    message: "User successfully logged out",
  });
});
