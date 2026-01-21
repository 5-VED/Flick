const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');
const UserHooks = require('./Shared/User.hooks');
const { USER_STATUS } = require('../Constants/enums');

const userSchema = new Schema(
  {
    first_name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    last_name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    phone: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
    address: {
      type: Schema.Types.String,
      default: null,
    },
    gender: {
      type: Schema.Types.String,
      enum: ['male', 'female'],
      default: null,
    },
    profile_pic: {
      type: Schema.Types.String,
      default: '',
    },
    country_code: {
      type: Schema.Types.String,
      default: '+91',
    },
    status: {
      type: Schema.Types.String,
      enum: Object.values(USER_STATUS),
      default: 'offline',
    },
    last_activee_at: {
      type: Schema.Types.Date,
      default: null,
    },
    devicee_token: {
      type: Schema.Types.String,
      default: '',
    },
    is_authorized_rider: {
      type: Schema.Types.Boolean,
      default: false,
    },
    confirmation_code: {
      type: Schema.Types.String,
      default: null,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'User_Master',
    timestamps: true,
  }
);

// Indexes of Users Model
const indexes = [
  { email: 1 },
  { phone: 1 },
  { email: 1, phone: 1 },
  { status: 1 },
  { role: 1 },
  { is_authorized_rider: 1 },
];

// Initialice pre hooks
UserHooks.applyPreHooks(userSchema);

// Initialice post hooks
UserHooks.applyPostHooks(userSchema);

// Create Indexes
UserHooks.createIndexes(userSchema, indexes);

const Users = model('User', userSchema);

module.exports = Users;
