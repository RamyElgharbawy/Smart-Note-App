const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const { sanitizeUser } = require("../utils/sanitizeData");
const userModel = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

// @desc  Authentication service Middleware
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

  // 2- verify token (no changes happened, expired time).
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3- verify user if exist.
  const currentUser = await userModel.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError("This user doesn`t exist", 401));
  }

  // 4- check user password if changed after token created.
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

// @desc      Change User Image Service
// @route     PATCH /api/v1/user/profileImage
// @access    Private
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
