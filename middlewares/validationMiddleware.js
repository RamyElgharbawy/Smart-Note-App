// const Joi = require("joi");

// const validationMiddleware = (schema) => async (req, res, next) => {
//   const { error, value } = await schema.validateAsync(req.body, {
//     abortEarly: false, // Return all validation errors, not just the first one
//     stripUnknown: true, // Remove any additional fields not in schema
//   });

//   if (error) {
//     (isValid = false),
//       (errors = error.details.map((detail) => ({
//         field: detail.path[0],
//         message: detail.message,
//       })));

//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: validation.errors,
//       });
//     }
//   }

//   (isValid = true),
//     (data = value),
//     // Add validated data to request object
//     (req.validatedData = validation.data);
//   next();
// };

// module.exports = validationMiddleware;
// middleware/validation.js

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Use validateAsync for async validation
      const { error, value } = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      console.log(value);
      if (error) {
        const errorMessages = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
      }
      console.log(value);

      // Replace req.body with the validated data
      //   req.validatedData = validation.data;
      next();
    } catch (error) {
      // Handle validation errors
      if (error.details) {
        const errorMessages = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
      }

      // Handle other errors
      console.error("Validation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

module.exports = validateRequest;
