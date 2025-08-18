// @desc remove user sensitive data from user doc
exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    email: user.email,
  };
};
