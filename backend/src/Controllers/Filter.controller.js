const { FilterModel, ConversationModel, MessageModel, UserModel } = require('../Models');
const { HTTP_CODES } = require('../Constants/enums');
const messages = require('../Constants/messages');
const { Engine, SystemFilters } = require('../Filters');

const ENTITY_MODEL_MAP = {
    'conversation': ConversationModel,
    'message': MessageModel,
    'user': UserModel
    // Add other entities as needed
};

module.exports = {
    createFilter: async (req, res) => {
        try {
            const { ...payload } = req.body;
            const user_id = req.user._id;

            const newFilter = await FilterModel.create({ ...payload, user_id });

            return res.status(HTTP_CODES.CREATED).json({
                success: true,
                message: messages.FILTER_CREATED,
                data: newFilter,
            });

        } catch (error) {
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: messages.INTERNAL_SERVER_ERROR,
                error,
            });
        }
    },

    filterData: async (req, res) => {
        try {
            const { key, filter_id, filter_def } = req.body;
            let filterDefinition = null;

            // 1. Resolve Filter Definition
            if (key) {
                // System Filter
                if (SystemFilters[key]) {
                    filterDefinition = SystemFilters[key].defination(); // It's a function returning object
                } else {
                    return res.status(HTTP_CODES.NOT_FOUND).json({ success: false, message: 'System filter not found' });
                }
            } else if (filter_id) {
                // Stored Filter
                filterDefinition = await FilterModel.findById(filter_id).lean();
                if (!filterDefinition) {
                    return res.status(HTTP_CODES.NOT_FOUND).json({ success: false, message: 'Filter not found' });
                }
            } else if (filter_def) {
                // Ad-hoc Filter
                filterDefinition = filter_def;
            } else {
                return res.status(HTTP_CODES.BAD_REQUEST).json({ success: false, message: 'No filter provided' });
            }

            // 2. Identify Model
            const Model = ENTITY_MODEL_MAP[filterDefinition.entity];
            if (!Model) {
                return res.status(HTTP_CODES.BAD_REQUEST).json({
                    success: false,
                    message: `Entity '${filterDefinition.entity}' is not supported for filtering`
                });
            }

            // 3. Build Query
            const query = Engine.buildQuery(filterDefinition);

            // 4. Execute Query
            // You might want to add pagination or field selection here
            const data = await Model.find(query).limit(50); // Hard limit for safety

            return res.status(HTTP_CODES.OK).json({
                success: true,
                message: 'Data filtered successfully',
                data: data,
                meta: {
                    filter_applied: filterDefinition.name
                }
            });

        } catch (error) {
            console.error('Filter Error:', error);
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: messages.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    }
}
