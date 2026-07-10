const Redis = require('ioredis');
const logger = require('../Utils/logger.utils');

const connectRedis = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('Redis unavailable — running without cache');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000);
    },
  });

  client.on('error', err => {
    logger.warn('Redis connection error (non-fatal):', err.message);
  });

  client.on('connect', () => {
    logger.info('Connected to Redis');
  });

  client.connect().catch(err => {
    logger.warn('Redis not available — app will run without cache');
  });

  return client;
};

module.exports = connectRedis;
