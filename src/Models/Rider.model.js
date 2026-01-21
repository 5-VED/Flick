const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const riderSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle_details: {
      vehicle_no: {
        type: Schema.Types.String,
        required: true,
      },
      vehicle_rc_no: {
        type: Schema.Types.String,
        required: true,
      },
      puc_certificate_no: {
        type: Schema.Types.String,
        required: true,
      },
      puc_validity: {
        type: Schema.Types.String,
        required: true,
      },
    },
    vehicle_photo: [
      {
        type: Schema.Types.String,
        required: true,
      },
    ],
    bank_details: {
      ifsc_code: {
        type: Schema.Types.String,
        required: true,
      },
      account_no: {
        type: Schema.Types.String,
        required: true,
      },
      bank_name: {
        type: Schema.Types.String,
        required: true,
      },
    },
    on_duty: {
      type: Schema.Types.Boolean,
      default: false,
    },
    rating: {
      type: Schema.Types.Number,
      default: 0,
    },
    total_rides: {
      type: Schema.Types.Number,
      default: 0,
    },
    driving_liscence_no: {
      type: Schema.Types.String,
      required: true,
    },
    adhaar_card_no: {
      type: Schema.Types.String,
      required: true,
    },
    adhaar_card_photo: {
      type: Schema.Types.String,
      required: true,
    },
    pan_card_no: {
      type: Schema.Types.String,
      required: true,
    },
    pan_card_photo: {
      type: Schema.Types.String,
      required: true,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Rider_Master',
  }
);

const Rider = model('Rider', riderSchema);

module.exports = Rider;
