const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');
const { RIDE_STATUS } = require('../Constants/enums');

const rideSchema = new Schema(
  {
    rider_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    boked_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    pickup_location: {
      type: Schema.Types.String,
      required: true,
    },
    pickup_location_coords: {
      latitude: {
        type: Schema.Types.Number,
        required: true,
      },
      longitude: {
        type: Schema.Types.Number,
        required: true,
      },
    },
    drop_locatin_coords: {
      latitude: {
        type: Schema.Types.Number,
        required: true,
      },
      longitude: {
        type: Schema.Types.Number,
        required: true,
      },
    },
    captain: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    start_time: {
      type: Schema.Types.Date,
      default: Date.now(),
    },
    end_time: {
      type: Schema.Types.Date,
      default: null,
    },
    status: {
      type: Schema.Types.String,
      enum: [
        RIDE_STATUS.REQUESTED,
        RIDE_STATUS.REJECTED,
        RIDE_STATUS.ONTHEWAY,
        RIDE_STATUS.ARRIVED,
        RIDE_STATUS.CANCELLED,
        RIDE_STATUS.COMPLETED,
      ],
      default: RIDE_STATUS.REQUESTED,
    },
    ...baseFieldsSchema.obj,
  },
  {
    collection: 'Ride_Master',
  }
);

const Ride = model('Ride', rideSchema);

module.exports = Ride;
