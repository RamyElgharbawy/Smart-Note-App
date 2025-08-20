const express = require("express");
const { forgotPassword, resetPassword } = require("../services/authService");
const {
  forgetPasswordValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post("/forgotPassword", forgetPasswordValidator, forgotPassword);
router.post("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
