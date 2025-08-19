const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation function
const validateLogin = (data) => {
  const { error, value } = loginSchema.validate(data, {
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

const loginValidationMiddleware = (req, res, next) => {
  const validation = validateLogin(req.body);

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
  loginValidationMiddleware,
};
