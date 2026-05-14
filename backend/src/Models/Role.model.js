const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const roleSchema = new Schema(
  {
    role: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Role_Master',
  }
);

const Roles = model('Role', roleSchema);

module.exports = Roles;
