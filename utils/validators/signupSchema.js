const Joi = require("joi");

const signupSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org", "edu", "gov", "io", "co"] },
    })
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must not exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*)",
      "any.required": "Password is required",
    }),
});

// Validation function
const validateSignup = (data) => {
  const { error, value } = signupSchema.validate(data, {
    abortEarly: false, // Return all validation errors, not just the first one
    stripUnknown: true, // Remove any additional fields not in schema
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

const signupValidationMiddleware = (req, res, next) => {
  const validation = validateSignup(req.body);

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
  signupValidationMiddleware,
};
