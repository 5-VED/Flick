const Joi = require('joi');

// Login Validation payload
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

// Signup Validation payload
const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required',
    }),
  first_name: Joi.string().min(2).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'any.required': 'First name is required',
  }),
  last_name: Joi.string().min(2).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'any.required': 'Last name is required',
  }),
  role: Joi.string().hex().length(24).messages({
    'string.hex': 'Invalid role ID format',
    'string.length': 'Invalid role ID length',
  }),
  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only': 'Gender must be either male, female, or other',
    'any.required': 'Gender is required',
  }),
  country_code: Joi.string()
    .pattern(/^\+[0-9]{1,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Country code must start with + followed by 1-4 digits',
      'any.required': 'Country code is required',
    }),
  is_authorized_rider: Joi.boolean().default(false),
});

// Add Attachments Validation payload
const addAttachmentsSchema = Joi.object({
  file: Joi.array()
    .items(
      Joi.object({
        fieldname: Joi.string().required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string()
          .valid('image/jpeg', 'image/png', 'image/gif', 'application/pdf')
          .required()
          .messages({
            'any.only': 'File type must be jpeg, png, gif, or pdf',
          }),
        size: Joi.number()
          .max(5 * 1024 * 1024)
          .required()
          .messages({
            'number.max': 'File size must be less than 5MB',
          }),
      })
    )
    .required()
    .messages({
      'any.required': 'At least one file is required',
    }),
});

// Remove Attachments Validation payload
const removeAttachmentsSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid attachment ID format',
      'string.length': 'Invalid attachment ID length',
      'any.required': 'Attachment ID is required',
    }),
  }),
});

// Disable User Validation payload
const disableUserSchema = Joi.object({
  body: Joi.object({
    _id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid user ID format',
      'string.length': 'Invalid user ID length',
      'any.required': 'User ID is required',
    }),
  }),
});

module.exports = {
  loginSchema,
  signupSchema,
  addAttachmentsSchema,
  removeAttachmentsSchema,
  disableUserSchema,
};
