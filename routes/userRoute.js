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
  signupValidator,
  loginValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.patch(
  "/profileImage",
  authService.protect,
  upload.single("profileImage"),
  changeProfileImage
);
router.post("/logout", authService.protect, loginValidator, logout);

module.exports = router;
