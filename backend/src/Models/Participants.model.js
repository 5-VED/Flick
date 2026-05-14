const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const participantsSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    joined_at: {
      type: Schema.Types.Date,
      default: Date.now(),
    },
    left_at: {
      type: Schema.Types.Date,
      default: null,
    },
    is_admin: {
      type: Schema.Types.Boolean,
      default: false,
    },
    last_read_message_id: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    last_delivered_message_id: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Participants',
  }
);

const Participant = model('Participants', participantsSchema);

module.exports = Participant;
