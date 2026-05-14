const rateLimit = require('express-rate-limit');
const { HTTP_CODES } = require('../Constants/enums');
const logger = require('../Utils/logger.utils');

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    code: HTTP_CODES.TOO_MANY_REQUESTS,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(HTTP_CODES.TOO_MANY_REQUESTS).json(options.message);
  },
});


// Export limiters
module.exports = {
  generalLimiter,
};
