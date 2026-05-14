const opencage = require('opencage-api-client');
const { OPEN_CAGE_API_KEY } = require('../Config/config');
const logger = require('./logger.utils');

const forward_geocoding = async (lat, long) => {
  try {
    if (!lat || !long) {
      throw new Error('Latitude and longitude are required');
    }

    if (!OPEN_CAGE_API_KEY) {
      throw new Error('OpenCage API key is not configured');
    }

    const data = await opencage.geocode({
      q: `${lat},${long}`,
      key: OPEN_CAGE_API_KEY,
      limit: 1, // Only get the first result
      no_annotations: 1, // Reduce response size
      language: 'en',
    });

    if (!data.results || data.results.length === 0) {
      throw new Error('No geocoding results found');
    }

    logger.info('Forward geocoding successful', {
      coordinates: `${lat},${long}`,
      resultsCount: data.results.length,
    });

    return data.results[0];
  } catch (error) {
    logger.error('Forward geocoding failed:', {
      error: error.message,
      coordinates: `${lat},${long}`,
      stack: error.stack,
    });
    throw error;
  }
};

const reverse_geocoding = async address => {
  try {
    if (!address) {
      throw new Error('Address is required');
    }

    if (!OPEN_CAGE_API_KEY) {
      throw new Error('OpenCage API key is not configured');
    }

    const data = await opencage.geocode({
      q: address,
      key: OPEN_CAGE_API_KEY,
      limit: 1,
      no_annotations: 1,
      language: 'en',
    });

    if (!data.results || data.results.length === 0) {
      throw new Error('No reverse geocoding results found');
    }

    logger.info('Reverse geocoding successful', {
      address,
      resultsCount: data.results.length,
    });

    return data.results;
  } catch (error) {
    logger.error('Reverse geocoding failed:', {
      error: error.message,
      address,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  forward_geocoding,
  reverse_geocoding,
};
