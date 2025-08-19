// @desc remove user sensitive data from user doc
exports.sanitizeUser = function (user) {
  const userWithoutPass = user.toObject();
  delete userWithoutPass.password;
  return {
    ...userWithoutPass,
  };
};
