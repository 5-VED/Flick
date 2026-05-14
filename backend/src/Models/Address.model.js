const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const addressSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    city: {
      type: Schema.Types.String,
      required: true,
    },
    state: {
      type: Schema.Types.String,
      required: true,
    },
    country: {
      type: Schema.Types.String,
      required: true,
    },
    postal_code: {
      type: Schema.Types.String,
      required: true,
    },
    address_type: {
      type: Schema.Types.String,
      required: true,
      default: 'WORK',
    },
    is_favourite: {
      type: Schema.Types.Boolean,
      default: false,
    },
    // Use reverse geocoding to get co-ordinates
    location: {
      type: {
        type: Schema.Types.String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Schema.Types.String],
        required: true,
      },
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Address_Master',
  }
);

const Address = model('Address', addressSchema);

module.exports = Address;
