const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');

const disputeSchema = new Schema(
  {
    ride_id: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
    raised_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    against: { type: Schema.Types.ObjectId, ref: 'User' },
    issue_type: {
      type: Schema.Types.String,
      enum: ['Overcharged', 'Ride Cancelled by Rider', 'Unsafe Driving', 'Wrong Route Taken', 'Misbehavior', 'Lost Item', 'Driver No Show', 'Payment Issue', 'Wrong Pickup', 'Other'],
      required: true,
    },
    description: { type: Schema.Types.String, required: true },
    status: {
      type: Schema.Types.String,
      enum: ['Open', 'Resolved', 'Escalated', 'Closed'],
      default: 'Open',
    },
    resolution_note: { type: Schema.Types.String, default: null },
    resolved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolved_at: { type: Schema.Types.Date, default: null },
    ...baseFieldsSchema.obj,
  },
  { collection: 'Dispute_Master', timestamps: true }
);

module.exports = model('Dispute', disputeSchema);
