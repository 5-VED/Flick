const mongoose = require('mongoose');
const { Schema } = mongoose;
const baseFieldsSchema = require('./BaseFields.model');
const UserAgentHelper = require('../Models/Shared/User.hooks');
const { BROWSER_TYPE } = require('../Constants/enums');

const UserAgentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    browser: {
      name: {
        type: Schema.Types.String,
        required: true,
      },
      version: {
        type: Schema.Types.String,
      },
      type: {
        type: Schema.Types.String,
        enum: Object.values(BROWSER_TYPE),
        default: 'other',
      },
    },
    os: {
      name: {
        type: Schema.Types.String,
        required: true,
      },
      platform: {
        type: Schema.Types.String,
      },
      version: {
        type: Schema.Types.String,
      },
      type: {
        type: Schema.Types.String,
        enum: ['android', 'ios', 'windows', 'mac', 'linux', 'other'],
        default: 'other',
      },
    },
    device: {
      type: {
        type: Schema.Types.String,
        enum: ['mobile', 'tablet', 'desktop', 'unknown'],
        required: true,
      },
      isBot: {
        type: Schema.Types.Boolean,
        default: false,
      },
    },
    source: {
      type: Schema.Types.String,
    },
    last_login: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    is_current: {
      type: Schema.Types.Boolean,
      default: true,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'User_Agent',
    timestamps: true,
  }
);

const indexes = [
  { user_id: 1, last_login: -1 },
  { 'device.type': 1 },
  { 'browser.type': 1, 'os.type': 1 },
];

UserAgentHelper.createIndexes(UserAgentSchema, indexes);

// Method to update last login
UserAgentSchema.methods.updateLastLogin = function () {
  this.last_login = new Date();
  return this.save();
};

// Method to mark as not current
UserAgentSchema.methods.markAsNotCurrent = function () {
  this.is_current = false;
  return this.save();
};

// Static method to get current user agent
UserAgentSchema.statics.getCurrentUserAgent = function (userId) {
  return this.findOne({
    user_id: userId,
    is_current: true,
  });
};

// Static method to get user's device history
UserAgentSchema.statics.getUserDeviceHistory = function (userId, limit = 10) {
  return this.find({
    user_id: userId,
  })
    .sort({ last_login: -1 })
    .limit(limit);
};

// Static method to get device statistics
UserAgentSchema.statics.getDeviceStats = function (userId) {
  return this.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$device.type',
        count: { $sum: 1 },
        lastLogin: { $max: '$last_login' },
      },
    },
  ]);
};

// Static method to get browser statistics
UserAgentSchema.statics.getBrowserStats = function (userId) {
  return this.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$browser.type',
        count: { $sum: 1 },
        versions: { $addToSet: '$browser.version' },
      },
    },
  ]);
};

const UserAgent = mongoose.model('UserAgent', UserAgentSchema);

module.exports = UserAgent;
