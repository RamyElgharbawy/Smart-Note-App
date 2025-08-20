const Joi = require("joi");
const createValidationMiddleware = require("../../middlewares/validationMiddleware");

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  resetCode: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const forgetPasswordValidator =
  createValidationMiddleware(forgetPasswordSchema);

const resetPasswordValidator = createValidationMiddleware(resetPasswordSchema);

module.exports = { forgetPasswordValidator, resetPasswordValidator };
