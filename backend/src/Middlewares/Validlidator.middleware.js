const Joi = require('joi');
const pick = require('../Utils/pick.utils');
const { HTTP_CODES } = require('../Constants/enums');

const errors = {
  labels: true,
};

const validateRequest = schema => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object, errors);

  if (error) {
    return res.status(HTTP_CODES.NOT_FOUND).json({
      success: false,
      message: error.details.map(ele => ele.message).join(', '),
      data: {},
    });
  }
  Object.assign(req, value);
  return next();
};

module.exports = { validateRequest };
