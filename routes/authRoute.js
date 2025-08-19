const express = require("express");
const { forgotPassword, resetPassword } = require("../services/authService");

const router = express.Router();

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
