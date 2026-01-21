const { Schema, model } = require('mongoose');
const baseFieldsSchema = require('./BaseFields.model');
const enums = require('../Constants/enums');

const filterFieldSchema = new Schema({
    field: {
        type: Schema.Types.String,
        required: true
    },
    operator: {
        type: Schema.Types.String,
        enum: Object.values(enums.OPERATORS),
        required: true
    },
    value: {
        type: Schema.Types.String, required: true
    },
})

const filterSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User_Master',
    },
    name: {
        type: Schema.Types.String,
        required: true
    },
    entity: {
        type: Schema.Types.String,
        required: true
    },
    fields: { type: [filterFieldSchema], required: true },
    logic: {
        type: Schema.Types.String,
        enum: Object.values(enums.LOGIC),
        default: enums.LOGIC.AND
    },
    ...baseFieldsSchema.obj,
}, {
    collection: 'Filter_Master',
    timestamps: true,
}
);


const Filter = model('Filter', filterSchema);
module.exports = Filter;
