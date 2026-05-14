const logger = require('../Utils/logger.utils');
const UserAgent = require('../Models/UserAgent.model');

const getBrowserType = ua => {
  if (ua.chrome) return 'chrome';
  if (ua.firefox) return 'firefox';
  if (ua.safari) return 'safari';
  if (ua.opera) return 'opera';
  if (ua.ie) return 'ie';
  if (ua.edge) return 'edge';
  if (ua.brave) return 'brave';
  return 'other';
};

const getOsType = ua => {
  if (ua.isAndroid) return 'android';
  if (ua.isiOS) return 'ios';
  if (ua.isWindows) return 'windows';
  if (ua.isMac) return 'mac';
  if (ua.isLinux) return 'linux';
  return 'other';
};

const getDeviceType = ua => {
  if (ua.isMobile) return 'mobile';
  if (ua.isTablet) return 'tablet';
  if (ua.isDesktop) return 'desktop';
  return 'unknown';
};

const userAgentMiddleware = async (req, res, next) => {
  try {
    const ua = req.useragent;

    // Log user agent information
    logger.info('User Agent Info', {
      browser: {
        name: ua.browser,
        version: ua.version,
        type: getBrowserType(ua),
      },
      os: {
        name: ua.os,
        platform: ua.platform,
        version: ua.osVersion,
        type: getOsType(ua),
      },
      device: {
        type: getDeviceType(ua),
        isBot: ua.isBot,
      },
      source: ua.source,
    });

    // Add user agent info to request for use in routes
    req.userAgentInfo = {
      browser: {
        name: ua.browser,
        version: ua.version,
        type: getBrowserType(ua),
      },
      os: {
        name: ua.os,
        platform: ua.platform,
        type: getOsType(ua),
      },
      device: {
        type: getDeviceType(ua),
        isBot: ua.isBot,
      },
    };

    // If user is authenticated, store user agent info
    if (req.user && req.user._id) {
      // Mark previous user agent as not current
      await UserAgent.updateMany(
        { user_id: req.user._id, is_current: true },
        { is_current: false }
      );

      // Create new user agent record
      await UserAgent.create({
        user_id: req.user._id,
        browser: {
          name: ua.browser,
          version: ua.version,
          type: getBrowserType(ua),
        },
        os: {
          name: ua.os,
          platform: ua.platform,
          version: ua.osVersion,
          type: getOsType(ua),
        },
        device: {
          type: getDeviceType(ua),
          isBot: ua.isBot,
        },
        source: ua.source,
      });
    }

    next();
  } catch (error) {
    logger.error('Error in user agent middleware', { error: error.message });
    next();
  }
};

module.exports = { userAgentMiddleware };
