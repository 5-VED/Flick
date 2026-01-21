const enums = require("../Constants/enums");

class FilterEngine {
    constructor() {
        this.operators = {
            [enums.OPERATORS.EQUALS]: (val) => val,
            [enums.OPERATORS.NOT_EQUALS]: (val) => ({ $ne: val }),
            [enums.OPERATORS.GREATER_THAN]: (val) => ({ $gt: val }),
            [enums.OPERATORS.GREATER_THAN_EQUAL]: (val) => ({ $gte: val }),
            [enums.OPERATORS.LESS_THAN]: (val) => ({ $lt: val }),
            [enums.OPERATORS.LESS_THAN_EQUAL]: (val) => ({ $lte: val }),
            [enums.OPERATORS.IN]: (val) => ({ $in: Array.isArray(val) ? val : val.split(',') }),
            [enums.OPERATORS.NOT_IN]: (val) => ({ $nin: Array.isArray(val) ? val : val.split(',') }),
            [enums.OPERATORS.CONTAINS]: (val) => ({ $regex: val, $options: 'i' }),
            [enums.OPERATORS.BETWEEN]: (val) => {
                const [min, max] = Array.isArray(val) ? val : val.split(',');
                return { $gte: min, $lte: max };
            }
        };
    }

    buildQuery(filterDef) {
        if (!filterDef || !filterDef.fields || filterDef.fields.length === 0) {
            return {};
        }

        const logicOperator = filterDef.logic === enums.LOGIC.OR ? '$or' : '$and';
        const criteria = filterDef.fields.map(field => this._buildFieldQuery(field));

        if (criteria.length === 0) {
            return {};
        }

        if (criteria.length === 1 && logicOperator === '$and') {
            // Optimization: If only one condition, no need for $and array
            return criteria[0];
        }

        return { [logicOperator]: criteria };
    }

    /**
     * Build a query fragment for a single field field.
     * @param {Object} fieldDef - Field definition.
     * @returns {Object} Query fragment.
     */
    _buildFieldQuery(fieldDef) {
        const { field, operator, value } = fieldDef;
        const opFunc = this.operators[operator];

        if (!opFunc) {
            console.warn(`Operator ${operator} not supported`);
            return {};
        }

        return { [field]: opFunc(value) };
    }
}

module.exports = new FilterEngine();
