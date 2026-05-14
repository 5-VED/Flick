const mongoose = require('mongoose');
const logger = require('../Utils/logger.utils');
const uri = process.env.MONGODB_URI; // Make sure to set this in your .env file

const connectMongoDB = async () => {
  try {
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};
module.exports = connectMongoDB;
