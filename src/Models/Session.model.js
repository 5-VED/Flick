const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const sessionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    device_info: {
      type: Schema.Types.String,
      trim: true,
    },
    user_agent_id: {
      // link to the detailed UserAgentModel record for this login, if you want to keep both
      type: Schema.Types.ObjectId,
      ref: 'UserAgent',
    },
    ip_address: {
      type: Schema.Types.String,
    },
    is_active: {
      type: Schema.Types.Boolean,
      default: true,
      index: true,
    },
    last_login: {
      type: Schema.Types.Date,
      default: Date.now, // <-- no parens: was firing once at module load, not per-doc
    },
    last_active_at: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    expires_at: {
      type: Schema.Types.Date,
      required: true,
      index: { expires: 0 }, // TTL index — Mongo auto-deletes the doc once this time passes
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Session_Master',
    timestamps: true,
    versionKey: false,
  }
);

sessionSchema.index({ user_id: 1, is_active: 1 });

const Session = model('Session', sessionSchema);

module.exports = Session;