const Joi = require("joi");

const resetPasswordSchema = Joi.object({
  resetCode: Joi.string().required(),
  newPassword: Joi.string().required(),
});

// Validation function
const validateResetPassword = (data) => {
  const { error, value } = resetPasswordSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      })),
    };
  }

  return {
    isValid: true,
    data: value,
  };
};

const resetPasswordValidationMiddleware = (req, res, next) => {
  const validation = validateResetPassword(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  // Add validated data to request object
  req.validatedData = validation.data;
  next();
};

module.exports = {
  resetPasswordValidationMiddleware,
};
