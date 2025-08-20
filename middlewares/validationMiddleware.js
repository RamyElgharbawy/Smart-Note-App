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
