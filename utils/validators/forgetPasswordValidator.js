const Joi = require("joi");

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Validation function
const validateForgetPassword = (data) => {
  const { error, value } = forgetPasswordSchema.validate(data, {
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

const forgetPasswordValidationMiddleware = (req, res, next) => {
  const validation = validateForgetPassword(req.body);

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
  forgetPasswordValidationMiddleware,
};
