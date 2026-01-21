const Joi = require('joi');

const addRoleValidator = Joi.object({
  role: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Role name is required',
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 50 characters',
    'any.required': 'Role name is required',
  }),
});

const removeRoleValidator = Joi.object({
  role: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Role name is required',
    'string.min': 'Role name must be at least 2 characters long',
    'string.max': 'Role name cannot exceed 50 characters',
    'any.required': 'Role name is required',
  }),
});

module.exports = {
  addRoleValidator,
  removeRoleValidator,
};
