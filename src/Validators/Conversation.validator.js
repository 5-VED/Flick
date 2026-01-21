const Joi = require('joi');

const addConversationValidator = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Conversation name is required',
    'string.min': 'Conversation name must be at least 1 character long',
    'string.max': 'Conversation name cannot exceed 100 characters',
    'any.required': 'Conversation name is required',
  }),

  participants: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Each participant must be a valid MongoDB ObjectId',
        })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Participants must be an array',
      'array.min': 'At least one participant is required',
      'any.required': 'Participants are required',
    }),
});

const getConversationValidator = Joi.object({
  conversation_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Conversation ID must be a valid MongoDB ObjectId',
      'any.required': 'Conversation ID is required',
    }),
});

const editConversationValidator = {
  query: Joi.object({
    conversation_id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Conversation ID must be a valid MongoDB ObjectId',
        'any.required': 'Conversation ID is required',
      }),
  }),

  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'Conversation name cannot be empty',
      'string.min': 'Conversation name must be at least 1 character long',
      'string.max': 'Conversation name cannot exceed 100 characters',
    }),

    participants: Joi.array()
      .items(
        Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .messages({
            'string.pattern.base': 'Each participant must be a valid MongoDB ObjectId',
          })
      )
      .min(1)
      .optional()
      .messages({
        'array.base': 'Participants must be an array',
        'array.min': 'At least one participant is required',
      }),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field (name or participants) must be provided for update',
    }),
};

const deleteConversationValidator = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Conversation name is required',
    'string.min': 'Conversation name must be at least 1 character long',
    'string.max': 'Conversation name cannot exceed 100 characters',
    'any.required': 'Conversation name is required',
  }),
});

module.exports = {
  addConversationValidator,
  getConversationValidator,
  editConversationValidator,
  deleteConversationValidator,
};
