const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');
const { FUEL } = require('../Constants/enums');
const { VEHICLE_CATEGORY } = require('../Constants/enums');

const vehicleSchema = new Schema(
  {
    // vehicle_type: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // vehicle_images: [
    //   {
    //     type: Schema.Types.String,
    //     required: true,
    //   },
    // ],
    // registeration_no: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // vehicle_photo: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // chassis_no: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // engine_no: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // manufacturer: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // fuel_type: {
    //   type: Schema.Types.String,
    //   enums: [FUEL.CNG, FUEL.DIESEL, FUEL.EV, FUEL.PETROL],
    //   required: true,
    // },
    // seating_capacity: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // sleeping_capacity: {
    //   type: Schema.Types.String,
    // },
    // standing_capacity: {
    //   type: Schema.Types.String,
    // },
    // cubic_capacity: {
    //   type: Schema.Type.Number,
    //   required: true,
    // },
    // vehicle_color: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // fitness_upto: {
    //   type: Schema.Types.Date,
    //   required: true,
    // },
    // vehicle_length: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // pollution_control_certificate: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // pollution_control_certificate_upto: {
    //   type: Schema.Types.Date,
    //   required: true,
    // },
    // rto: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    // noc_details: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    base_fare: {
      type: Schema.Types.String,
      required: true,
    },
    category: {
      type: Schema.Types.String,
      enum: Object.values(VEHICLE_CATEGORY),
    },
    per_km_rate: {
      type: Schema.Types.Number,
      required: true,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Vehicle_Master',
  }
);

const Vehicle = model('Vehicle', vehicleSchema);

module.exports = Vehicle;
