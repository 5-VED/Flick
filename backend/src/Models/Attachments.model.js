const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const attachmentSchema = new Schema(
  {
    file_name: {
      type: Schema.Types.String,
      trim: true,
    },
    file_type: {
      type: Schema.Types.String,
    },
    file_size: {
      type: Schema.Types.String,
    },
    file_url: {
      type: Schema.Types.String,
      trim: true,
    },
    uploaded_at: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Attachment_Master',
  }
);

const Attachments = model('Attachment', attachmentSchema);

module.exports = Attachments;
