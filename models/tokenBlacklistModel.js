// models/TokenBlacklist.js
const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token required"],
      unique: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

//  automatic expiration cleanup
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
