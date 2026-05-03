const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');
const { RIDE_STATUS, VEHICLE_CATEGORY } = require('../Constants/enums');

const rideSchema = new Schema(
  {
    rider_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    boked_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickup_location: {
      type: Schema.Types.String,
      required: true,
    },
    drop_location: {
      type: Schema.Types.String,
      required: true,
    },
    pickup_location_coords: {
      latitude: { type: Schema.Types.Number },
      longitude: { type: Schema.Types.Number },
    },
    drop_locatin_coords: {
      latitude: { type: Schema.Types.Number },
      longitude: { type: Schema.Types.Number },
    },
    vehicle_type: {
      type: Schema.Types.String,
      enum: Object.values(VEHICLE_CATEGORY),
      default: VEHICLE_CATEGORY.BIKE,
    },
    fare: {
      type: Schema.Types.Number,
      default: 0,
    },
    fare_breakdown: {
      base_fare: { type: Schema.Types.Number, default: 0 },
      distance_fare: { type: Schema.Types.Number, default: 0 },
      platform_fee: { type: Schema.Types.Number, default: 0 },
      gst: { type: Schema.Types.Number, default: 0 },
    },
    trip_distance: {
      type: Schema.Types.String,
      default: null,
    },
    trip_duration: {
      type: Schema.Types.String,
      default: null,
    },
    captain: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    start_time: {
      type: Schema.Types.Date,
      default: null,
    },
    end_time: {
      type: Schema.Types.Date,
      default: null,
    },
    status: {
      type: Schema.Types.String,
      enum: Object.values(RIDE_STATUS),
      default: RIDE_STATUS.REQUESTED,
    },
    cancellation_reason: {
      type: Schema.Types.String,
      default: null,
    },
    cancelled_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelled_at: {
      type: Schema.Types.Date,
      default: null,
    },
    rating: {
      type: Schema.Types.Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: Schema.Types.String,
      default: null,
    },
    payment_method: {
      type: Schema.Types.String,
      enum: ['Cash', 'UPI', 'Wallet'],
      default: 'Cash',
    },
    tip: {
      type: Schema.Types.Number,
      default: 0,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Ride_Master',
    timestamps: true,
  }
);

const Ride = model('Ride', rideSchema);

module.exports = Ride;
