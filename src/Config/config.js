require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  OPEN_CAGE_API_KEY: process.env.OPEN_CAGE_API_KEY,
  IPINFO_TOKEN: process.env.IPINFO_TOKEN,
  IPINFO_URL: process.env.IPINFO_URL,
  OSRM_SERVER_URL: process.env.OSRM_SERVER_URL || 'https://router.project-osrm.org',
};
