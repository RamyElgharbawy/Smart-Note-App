const Joi = require("joi");

const createNoteSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 1 character long",
    "string.max": "Title cannot exceed 100 characters",
  }),
  content: Joi.string().min(1).max(10000).required().messages({
    "string.empty": "Content is required",
    "string.min": "Content must be at least 1 character long",
    "string.max": "Content cannot exceed 10000 characters",
  }),
});

const noteFilterSchema = Joi.object({
  title: Joi.string().max(50).optional(),
  createdAfter: Joi.date().iso().optional().messages({
    "date.base": "createdAfter must be a valid date",
    "date.format": "createdAfter must be in ISO format (YYYY-MM-DD)",
  }),
  createdBefore: Joi.date().iso().optional().messages({
    "date.base": "createdBefore must be a valid date",
    "date.format": "createdBefore must be in ISO format (YYYY-MM-DD)",
  }),
  ownerId: Joi.string(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

module.exports = {
  createNoteSchema,
  noteFilterSchema,
  paginationSchema,
};
