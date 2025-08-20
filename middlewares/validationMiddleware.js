const createValidationMiddleware = (schema, options = {}) => {
  return (req, res, next) => {
    const { source = "body", customErrorHandler = null } = options;

    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      ...options,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      // Use custom error handler if provided
      if (customErrorHandler) {
        return customErrorHandler(errors, req, res, next);
      }

      // Default error response
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Add validated data to request object
    req.validatedData = value;
    next();
  };
};

module.exports = createValidationMiddleware;
