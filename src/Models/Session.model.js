const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const sessionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    socket_id: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    device_info: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    ip_address: {
      type: Schema.Types.String,
    },
    connected_at: {
      type: Schema.Types.Date,
      default: Date.now(),
    },
    disconnected_at: {
      type: Schema.Types.Date,
      default: null,
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
