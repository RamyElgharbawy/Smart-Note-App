const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password required"],
      minlength: [6, "To short password"],
    },
    profileImage: String,

    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpires: Date,
    passwordResetVerified: Boolean,
  },
  { timestamps: true }
);

// use mongoose middleware to hashing password before saving doc in db
userSchema.pre("save", async function (next) {
  // if password not modified skip hashing method
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});
module.exports = mongoose.model("User", userSchema);
