const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const server = http.createServer(app);
const initializeSockets = require('./Sockets/chat');
const logger = require('./Utils/logger.utils');
const connectMongoDB = require('./Database/MongoDB');
const connectRedis = require('./Database/Rdis');

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

(async () => {
  try {
    const [_] = await Promise.all([
      connectMongoDB().then(() => {
        logger.info('MongoDB connected successfully');
      }),
    ]);
    connectRedis()
    initializeSockets(server);
  } catch (err) {
    logger.error('Service connection error:', err);
    process.exit(1);
  }
})();

// Handle server errors
server.on('error', error => {
  logger.error('Server error occurred', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});
