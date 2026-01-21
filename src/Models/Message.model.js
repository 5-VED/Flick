const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const messageSchema = new Schema(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    is_favourite: {
      type: Schema.Types.Boolean,
      default: false,
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
    is_edited: {
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
