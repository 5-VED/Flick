const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const conversationSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
    },
    is_group_chat: {
      type: Schema.Types.Boolean,
      default: false,
    },
    group_avatar: {
      type: Schema.Types.String,
      default: '',
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    total_unread_messages: {
      type: Schema.Types.Number,
      default: 0,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Participants',
      },
    ],
    last_message: {
      content: { type: Schema.Types.String, default: 'Hello' },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      type: { type: Schema.Types.String, default: 'text' }, // text, image, etc.
      sent_at: { type: Schema.Types.Date, default: Date.now() },
    },
    ...baseFieldsSchema.obj,
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'Conversation_Master',
  }
);

const Converstion = model('Converstion', conversationSchema);

module.exports = Converstion;
