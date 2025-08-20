const express = require("express");
const { protect } = require("../services/authService");
const graphqlMiddleware = require("../middlewares/graphqlMiddleware");

const router = express.Router();

router.all("/", protect, graphqlMiddleware);

module.exports = router;
