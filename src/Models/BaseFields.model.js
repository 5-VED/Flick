const { Schema, model } = require('mongoose');

const baseFieldsSchema = new Schema(
  {
    is_deleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    is_active: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  {
    collation: 'BaseFields_Master',
  }
);

module.exports = baseFieldsSchema;
