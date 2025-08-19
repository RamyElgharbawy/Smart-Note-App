const express = require("express");
const {
  signup,
  login,
  changeProfileImage,
  logout,
} = require("../services/userService");
const upload = require("../middlewares/uploadImageMiddleware");
const authService = require("../services/authService");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch(
  "/profileImage",
  authService.protect,
  upload.single("profileImage"),
  changeProfileImage
);
router.post("/logout", authService.protect, logout);

module.exports = router;
