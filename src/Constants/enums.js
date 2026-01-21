const enums = {
  complexity: ['A', 'B', 'C', 'D'],

  platform: {
    WEB: 'Web',
    IOS: 'Ios',
    ANDROID: 'ANDROID',
  },

  COLORS: {
    // Basic colors
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
    GRAY: '\x1b[90m',

    // Bright colors
    BRIGHT_RED: '\x1b[91m',
    BRIGHT_GREEN: '\x1b[92m',
    BRIGHT_YELLOW: '\x1b[93m',
    BRIGHT_BLUE: '\x1b[94m',
    BRIGHT_MAGENTA: '\x1b[95m',
    BRIGHT_CYAN: '\x1b[96m',
    BRIGHT_WHITE: '\x1b[97m',

    // Background colors
    BG_RED: '\x1b[41m',
    BG_GREEN: '\x1b[42m',
    BG_YELLOW: '\x1b[43m',
    BG_BLUE: '\x1b[44m',
    BG_MAGENTA: '\x1b[45m',
    BG_CYAN: '\x1b[46m',
    BG_WHITE: '\x1b[47m',

    // Reset
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    DIM: '\x1b[2m',
    ITALIC: '\x1b[3m',
    UNDERLINE: '\x1b[4m',
    BLINK: '\x1b[5m',
    REVERSE: '\x1b[7m',
    HIDDEN: '\x1b[8m',
  },

  HTTP_CODES: {
    CREATED: 201,
    CONFLICT: 409,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
    MOVED_PERMANENTLY: 301,
    NO_CONTENT_FOUND: 204,
    NOT_ACCEPTABLE: 406,
    NOT_FOUND: 404,
    OK: 200,
    PERMANENT_REDIRECT: 308,
    UNAUTHORIZED: 401,
    UPGRADE_REQUIRED: 426,
    VALIDATION_ERROR: 422,
    TOO_MANY_REQUESTS: 429,
  },

  FUEL: {
    PETROL: 'Petrol',
    DIESEL: 'Diesel',
    EV: 'Ev',
    CNG: 'Cng',
  },

  RIDE_STATUS: {
    REQUESTED: 'Requested',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    STARTED: 'Started',
    ARRIVED: 'Arrived',
    ONTHEWAY: 'OnTheWay',
    COMPLETED: 'Completed',
  },

  ROLE: {
    SUPER_ADMIN: 'SuperAdmin',
    RIDER: 'Rider',
    USER: 'User',
    ADMIN: 'Admin',
  },

  VEHICLE_CATEGORY: {
    BIKE_LITE: 'BikeLite',
    BIKE: 'Bike',
    AUTO: 'Auto',
    CAB_ECONOMY: 'CabEconomy',
    CAB_PREMIUM: 'CabPremium',
    CAB_XL: 'Cab XL', // SUV
  },

  COMPANY_REQUEST_STATUS: {
    LEAD: 'LEAD',
    CONTACT_MADE: 'CONTACT_MADE',
    PROPOSAL_MADE: 'PROPOSAL_MADE',
    NEGOTIATIONS_STARTED: 'NEGOTIATIONS_STARTED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    COMPANYCREATED: 'COMPANYCREATED',
  },

  BROWSER_TYPE: {
    CHROME: 'chrome',
    FIREFOX: 'firefox',
    SAFARI: 'safari',
    OPERA: 'opera',
    IE: 'ie',
    EDGE: 'edge',
    BRAVE: 'brave',
    OTHER: 'other',
  },

  MAXATTACHMENTS: 100,

  USER_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    BUSY: 'busy',
    AWAY: 'away',
  },

  NOTIFICATION_TYPE: {
    MESSAGE: 'message',
    FRIEND_REQUEST: 'friend_request',
    GROUP_REQUEST: 'group_request',
    MENTION: 'mention',
  },

  MESSAGE_FILTER: {
    ALL: 'all',
    UNREAD: 'unread',
    READ: 'read',
    favorite: 'favorite',
    star: 'star',
  },

  OPERATORS: {
    EQUALS: 'eq',
    NOT_EQUALS: 'ne',
    GREATER_THAN: 'gt',
    GREATER_THAN_EQUAL: 'gte',
    LESS_THAN: 'lt',
    LESS_THAN_EQUAL: 'lte',
    IN: 'in',
    NOT_IN: 'nin',
    CONTAINS: 'contains',
    BETWEEN: 'between'
  },


  LOGIC: {
    AND: 'AND',
    OR: 'OR',
  },
};

module.exports = enums;
