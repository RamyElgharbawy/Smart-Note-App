const express = require("express");
const { forgotPassword, resetPassword } = require("../services/authService");
const {
  forgetPasswordValidationMiddleware,
} = require("../utils/validators/forgetPasswordValidator");
const {
  resetPasswordValidationMiddleware,
} = require("../utils/validators/resetPasswordValidator");

const router = express.Router();

router.post(
  "/forgotPassword",
  forgetPasswordValidationMiddleware,
  forgotPassword
);
router.post("/resetPassword", resetPasswordValidationMiddleware, resetPassword);

module.exports = router;
