// const winston = require('winston');
// const path = require('path');
// const fs = require('fs');

// // Create logs directory if it doesn't exist
// const logDir = 'logs';
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// // Custom colors for different log levels
// const customColors = {
//   error: 'red',
//   warn: 'yellow',
//   info: 'green',
//   http: 'magenta',
//   debug: 'blue',
//   success: 'green',
//   database: 'cyan',
//   socket: 'magenta',
//   security: 'red',
//   performance: 'yellow',
// };

// // Add custom colors to winston
// winston.addColors(customColors);

// // Define log format
// const logFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.errors({ stack: true }),
//   winston.format.splat(),
//   winston.format.json()
// );

// // Define console format for development with enhanced colors and formatting
// const consoleFormat = winston.format.combine(
//   winston.format.colorize({ all: true }),
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.printf(({ level, message, timestamp, ...metadata }) => {
//     // Create a colored level indicator
//     const levelUpper = level.toUpperCase();
//     let levelColor = '';

//     switch (level) {
//       case 'error':
//         levelColor = '\x1b[31m';
//         break;
//       case 'warn':
//         levelColor = '\x1b[33m';
//         break;
//       case 'info':
//         levelColor = '\x1b[32m';
//         break;
//       case 'http':
//         levelColor = '\x1b[35m';
//         break;
//       case 'debug':
//         levelColor = '\x1b[34m';
//         break;
//       default:
//         levelColor = '\x1b[37m';
//     }

//     // Format the timestamp
//     const timeColor = '\x1b[90m'; // Gray
//     const resetColor = '\x1b[0m'; // Reset

//     // Format the message
//     let msg = `${timeColor}[${timestamp}]${resetColor} ${levelColor}[${levelUpper}]${resetColor}: ${message}`;

//     // Add metadata if present
//     if (Object.keys(metadata).length > 0) {
//       // Format metadata with indentation
//       const metadataStr = JSON.stringify(metadata, null, 2);
//       msg += `\n${levelColor}Metadata:${resetColor}\n${metadataStr}`;
//     }

//     return msg;
//   })
// );

// // Create the logger instance
// const logger = winston.createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   format: logFormat,
//   defaultMeta: { service: 'flick-service' },
//   transports: [
//     // Write all logs with level 'error' and below to error.log
//     new winston.transports.File({
//       filename: path.join(logDir, 'error.log'),
//       level: 'error',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
//     // Write all logs with level 'info' and below to combined.log
//     new winston.transports.File({
//       filename: path.join(logDir, 'combined.log'),
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
//   ],
// });

// // If we're not in production, also log to the console
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new winston.transports.Console({
//       format: consoleFormat,
//     })
//   );
// }

// // Create a stream object for Morgan integration
// logger.stream = {
//   write: message => {
//     logger.info(message.trim());
//   },
// };

// // Custom logging methods with enhanced formatting
// const customLogger = {
//   // Log levels
//   error: (message, meta = {}) => {
//     logger.error(`❌ ${message}`, meta);
//   },
//   warn: (message, meta = {}) => {
//     logger.warn(`⚠️ ${message}`, meta);
//   },
//   info: (message, meta = {}) => {
//     logger.info(`ℹ️ ${message}`, meta);
//   },
//   debug: (message, meta = {}) => {
//     logger.debug(`🔍 ${message}`, meta);
//   },
//   success: (message, meta = {}) => {
//     logger.info(`✅ ${message}`, meta);
//   },
//   database: (message, meta = {}) => {
//     logger.info(`💾 ${message}`, meta);
//   },
//   socket: (message, meta = {}) => {
//     logger.info(`🔌 ${message}`, meta);
//   },
//   security: (message, meta = {}) => {
//     logger.warn(`🔒 ${message}`, meta);
//   },
//   performance: (message, meta = {}) => {
//     logger.info(`⚡ ${message}`, meta);
//   },
//   // HTTP request logging
//   http: (req, res, next) => {
//     const start = Date.now();
//     res.on('finish', () => {
//       const duration = Date.now() - start;
//       const statusColor = res.statusCode < 400 ? 'green' : 'red';
//       logger.info(`🌐 HTTP ${req.method} ${req.originalUrl}`, {
//         method: req.method,
//         url: req.originalUrl,
//         status: res.statusCode,
//         duration: `${duration}ms`,
//         ip: req.ip,
//         userAgent: req.get('user-agent'),
//       });
//     });
//     next();
//   },
//   // API response logging
//   apiResponse: (req, res, responseData) => {
//     logger.info(`📡 API Response`, {
//       method: req.method,
//       url: req.originalUrl,
//       status: res.statusCode,
//       responseTime: responseData.responseTime,
//       userId: req.user?.id,
//     });
//   },
//   // Error logging with stack trace
//   logError: (error, req = null) => {
//     const errorLog = {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//     };

//     if (req) {
//       errorLog.request = {
//         method: req.method,
//         url: req.originalUrl,
//         body: req.body,
//         params: req.params,
//         query: req.query,
//         headers: req.headers,
//         ip: req.ip,
//       };
//     }

//     logger.error(`💥 Error occurred`, errorLog);
//   },
// };

// module.exports = customLogger;

const winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

module.exports = logger;
