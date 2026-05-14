const { Schema, model } = require('mongoose');
const { NOTIFICATION_TYPE } = require('../Constants/enums');

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notification_type: {
      type: Schema.Types.String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    message_id: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    content: {
      type: Schema.Types.String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'Notification_Master',
  }
);

const Notification = model('Notification', notificationSchema);
module.exports = Notification;
