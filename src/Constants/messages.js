const messages = {
  ROLE_CREATED_SUCCESS: 'Role created successfully',
  ROLE_DELETED_SUCCESS: 'Role deleted successfully',
  INTERNAL_SERVER_ERROR: 'Internal server error',

  USER_ALREADY_EXISTS: 'User already exist',
  USER_CREATED_SUCCESS: 'User created successfully',
  USER_NOT_REGISTERED: 'User not registered',
  INCORRECT_PASSWORD: 'Please enter correct password.',
  USER_LOGIN_SUCCESS: 'User logged in Successfully.',
  USER_DISABLE_ERROR: 'Error occured while disabling the user.',
  USER_DISABLED_SUCCESS: 'User Disabled',
  LOCATION_NOT_FOUND: 'Location not found',

  EXTENSION_NOT_FOUND: 'Extension Not Found',
  ATTACHMENTS_ADDED_SUCCESS: 'Attachments added successfully',
  ATTACHMENT_NOT_FOUND: 'Attachment not found.',
  ATTACHMENT_REMOVED_SUCCESS: 'Attachment removed successfully.',

  GROUP_CREATE_ERROR: "Couldn't create group.",
  GROUP_CREATED_SUCCESS: 'Group conversation created successfully.',

  CONVERSATION_ID_REQUIRED: 'Conversation ID is required',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  CONVERSATION_RETRIEVED_SUCCESS: 'Conversation retrieved successfully',
  CONVERSATION_RETRIEVE_ERROR: 'Failed to retrieve conversation',
  CONVERSATION_UPDATED_SUCCESS: 'Conversation updated successfully',
  CONVERSATION_UPDATE_ERROR: 'Failed to update conversation',
  CONVERSATION_NAME_REQUIRED: 'Conversation name is required.',
  CONVERSATION_DELETED_SUCCESS: 'Conversation deleted successfully',
  CONVERSATION_DELETE_ERROR: 'Failed to delete conversation',

  RIDER_NOT_FOUND: 'Rider not found',
  RIDER_PROFILE_FETCHED: 'Rider profile fetched successfully',
  RIDER_REGISTERED_SUCCESS: 'Rider registered successfully',
  RIDER_ALREADY_EXISTS: 'Rider profile already exists for this user',
  VEHICLE_ALREADY_REGISTERED: 'Vehicle number is already registered',
  VEHICLE_IMAGES_REQUIRED: 'Vehicle images are required.',
  RIDE_BOOKED_SUCCESSFULLY: 'Ride booked successfully',

  DRIVING_LICENSE_ALREADY_EXISTS: 'Driving license is already registered',
  AADHAAR_ALREADY_EXISTS: 'Aadhaar card is already registered',
  PAN_ALREADY_EXISTS: 'PAN card is already registered',
  REQUIRED_DOCUMENTS_MISSING: 'Required documents are missing.',

  FILTER_CREATED: 'Filter created successfully',

  RIDE_NOT_FOUND: 'Ride not found',
  RIDE_CANCELLED_SUCCESSFULLY: 'Ride cancelled successfully',
  RIDE_STATUS_UPDATED: 'Ride status updated successfully',
  RIDE_RATED_SUCCESSFULLY: 'Ride rated successfully',
  RIDE_HISTORY_FETCHED: 'Ride history fetched successfully',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action',
  VALIDATION_ERROR: 'Validation error',

  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_INVALID: 'Invalid or expired OTP',
  OTP_RESENT: 'OTP resent successfully',
  PHONE_NOT_FOUND: 'No account found with this phone number',
  USER_PROFILE_FETCHED: 'Profile fetched successfully',
  USER_PROFILE_UPDATED: 'Profile updated successfully',

  ADMIN_STATS_FETCHED: 'Stats fetched successfully',
  ADMIN_CUSTOMERS_FETCHED: 'Customers fetched successfully',
  ADMIN_RIDERS_FETCHED: 'Riders fetched successfully',
  ADMIN_RIDES_FETCHED: 'Rides fetched successfully',
  ADMIN_DISPUTES_FETCHED: 'Disputes fetched successfully',
  RIDER_VERIFIED: 'Rider documents verified successfully',
  RIDER_BLOCKED: 'Rider blocked successfully',
  USER_STATUS_UPDATED: 'User status updated successfully',

  // Chat Authentication Messages
  CHAT_AUTH_SUCCESS: 'Authentication successful',
  CHAT_AUTH_FAILED: 'Authentication failed',
  CHAT_USER_NOT_FOUND: 'User not found',
  CHAT_INVALID_TOKEN: 'Invalid token',
  CHAT_UNAUTHORIZED: 'Unauthorized access',

  // Chat Message Messages
  CHAT_MESSAGE_SENT: 'Message sent successfully',
  CHAT_MESSAGE_DELIVERED: 'Message delivered successfully',
  CHAT_MESSAGE_READ: 'Message read successfully',
  CHAT_MESSAGE_FAILED: 'Failed to send message',
  CHAT_MESSAGE_NOT_FOUND: 'Message not found',

  // Chat Conversation Messages
  CHAT_CONVERSATION_CREATED: 'Conversation created successfully',
  CHAT_CONVERSATION_NOT_FOUND: 'Conversation not found',
  CHAT_CONVERSATION_UPDATED: 'Conversation updated successfully',
  CHAT_CONVERSATION_DELETED: 'Conversation deleted successfully',
  CHAT_CONVERSATION_FILTERED: 'Conversations filtered successfully',

  // Chat Typing Messages
  CHAT_TYPING_STARTED: 'User started typing',
  CHAT_TYPING_STOPPED: 'User stopped typing',

  // Chat User Status Messages
  CHAT_USER_ONLINE: 'User is online',
  CHAT_USER_OFFLINE: 'User is offline',
  CHAT_USER_AWAY: 'User is away',
  CHAT_USER_BUSY: 'User is busy',

  // Chat Error Messages
  CHAT_ERROR_INTERNAL: 'Internal server error',
  CHAT_ERROR_VALIDATION: 'Validation error',
  CHAT_ERROR_UNAUTHORIZED: 'Unauthorized access',
  CHAT_ERROR_NOT_FOUND: 'Resource not found',
};

module.exports = messages;
