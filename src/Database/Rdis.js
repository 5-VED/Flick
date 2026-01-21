const Redis = require('ioredis');
const logger = require('../Utils/logger.utils');

const connectRedis = () => {
  const client = new Redis({
    host: 'localhost',
    port: 6379,
  });

  client.on('error', err => {
    logger.error('Redis connection error:', err);
  });

  client.on('connect', () => {
    logger.info('Connected to Redis');
  });

  return client;
};

module.exports = connectRedis;
