const express = require("express");
const {
  signup,
  login,
  changeProfileImage,
  logout,
} = require("../services/userService");
const upload = require("../middlewares/uploadImageMiddleware");
const authService = require("../services/authService");
const {
  signupValidationMiddleware,
} = require("../utils/validators/signupSchema");
const {
  loginValidationMiddleware,
} = require("../utils/validators/loginValidator");

const router = express.Router();

router.post("/signup", signupValidationMiddleware, signup);
router.post("/login", loginValidationMiddleware, login);
router.patch(
  "/profileImage",
  authService.protect,
  upload.single("profileImage"),
  changeProfileImage
);
router.post("/logout", authService.protect, loginValidationMiddleware, logout);

module.exports = router;
