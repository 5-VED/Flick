const Joi = require('joi');

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  }),
};

const signupSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required',
    }),
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    role: Joi.string().hex().length(24).optional(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    country_code: Joi.string().pattern(/^\+[0-9]{1,4}$/).required().messages({
      'string.pattern.base': 'Country code must start with + followed by 1-4 digits',
    }),
    is_authorized_rider: Joi.boolean().default(false),
  }),
};

const addAttachmentsSchema = {};

const removeAttachmentsSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

const disableUserSchema = {
  body: Joi.object({
    _id: Joi.string().hex().length(24).required(),
  }),
};

module.exports = {
  loginSchema,
  signupSchema,
  addAttachmentsSchema,
  removeAttachmentsSchema,
  disableUserSchema,
};
