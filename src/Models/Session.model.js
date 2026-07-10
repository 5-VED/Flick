const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const sessionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    device_info: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    ip_address: {
      type: Schema.Types.String,
    },
    last_login: {
      type: Schema.Types.Date,
      default: Date.now(),
    },
    expires_at:{
      type: Schema.Types.Date,

    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Session_Master',
    timestamps: true,
    versionKey: false,
  }
);

const Session = model('Session', sessionSchema);

module.exports = Session;
