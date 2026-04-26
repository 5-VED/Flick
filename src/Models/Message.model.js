const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const messageSchema = new Schema(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
    // Quoted / reply-to message
    reply_to: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Emoji reactions: [{ user_id, emoji }]
    reactions: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: Schema.Types.String, trim: true },
        _id: false,
      },
    ],
    // Users who deleted this message for themselves only
    is_deleted_for: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    is_edited: {
      type: Schema.Types.Boolean,
      default: false,
    },
    is_favourite: {
      type: Schema.Types.Boolean,
      default: false,
    },
    ...baseFieldsSchema.obj,
  },
  {
    versionKey: false,
    collection: 'Message_Master',
    timestamps: true,
  }
);

const Message = model('Message', messageSchema);

module.exports = Message;
