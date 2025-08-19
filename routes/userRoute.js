const express = require("express");
const {
  signup,
  login,
  changeProfileImage,
  protect,
} = require("../services/userService");
const upload = require("../middlewares/uploadImageMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch(
  "/profileImage",
  protect,
  upload.single("profileImage"),
  changeProfileImage
);

module.exports = router;
