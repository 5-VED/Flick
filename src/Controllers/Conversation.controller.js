const { ConversationModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');
const { MESSAGE_FILTER } = require('../Constants/enums');

module.exports = {
  addConversation: async (req, res) => {
    try {
      const { name, participants } = req.body;

      const group = await ConversationModel.findOne({ name: req.body?.name });
      if (group) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.GROUP_CREATE_ERROR,
          data: {},
        });
      }

      const response = await ConversationModel.create({
        name,
        participants,
        is_group_chat: true,
        created_by: req.user._id,
      });

      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.GROUP_CREATED_SUCCESS,
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  },

  getConversation: async (req, res) => {
    try {
      const { conversation_id } = req.query;

      if (!conversation_id) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.CONVERSATION_ID_REQUIRED,
        });
      }

      const conversation = await ConversationModel.findOne({
        _id: conversation_id,
        is_deleted: false,
      }).populate('participants');

      if (!conversation) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.CONVERSATION_NOT_FOUND,
        });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.CONVERSATION_RETRIEVED_SUCCESS,
        data: conversation,
      });
    } catch (error) {
      console.error('Error in getConversation:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.CONVERSATION_RETRIEVE_ERROR,
        error: error.message,
      });
    }
  },

  editConversation: async (req, res) => {
    try {
      const { conversation_id } = req.query;
      const { name, participants } = req.body;

      if (!conversation_id) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.CONVERSATION_ID_REQUIRED,
        });
      }

      const conversation = await ConversationModel.findOne({
        _id: conversation_id,
        is_deleted: false,
        is_active: true,
      });

      if (!conversation) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.CONVERSATION_NOT_FOUND,
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (participants) updateData.participants = participants;

      const updatedConversation = await ConversationModel.findByIdAndUpdate(
        conversation_id,
        { $set: updateData },
        { new: true }
      ).populate('participants');

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.CONVERSATION_UPDATED_SUCCESS,
        data: updatedConversation,
      });
    } catch (error) {
      console.error('Error in editConversation:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.CONVERSATION_UPDATE_ERROR,
        error: error.message,
      });
    }
  },

  deleteConversation: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.CONVERSATION_NAME_REQUIRED,
        });
      }

      const conversation = await ConversationModel.findOne(
        {
          name,
          is_deleted: false,
        },
        null
      );

      if (!conversation) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.CONVERSATION_NOT_FOUND,
        });
      }

      // Soft delete the conversation
      await ConversationModel.findOneAndUpdate(
        name,
        { $set: { is_deleted: true, is_active: false } },
        { new: true }
      );

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.CONVERSATION_DELETED_SUCCESS,
      });
    } catch (error) {
      console.error('Error in deleteConversation:', error);

      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.CONVERSATION_DELETE_ERROR,
        error: error.message,
      });
    }
  },

  // Fetch all converstions
  getConversations: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      // const search = filter.search || '';
      // if (search) {
      //   filter.name = { $regex: search, $options: 'i' };
      // }

      // if (filter.is_group_chat) {
      //   filter.is_group_chat = { $eq: Boolean(filter.is_group_chat) };
      // }

      const pipeline = [
        // {
        //   $match: {
        //     ...filter,
        //   }, 
        // },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: 'Message_Master',
            let: { conversationId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$conversation_id', '$$conversationId'] },
                },
              },
              {
                $sort: { createdAt: -1 },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  _id: 1,
                  message: 1,
                  sender_id: 1,
                  createdAt: 1,
                  content: 1,
                },
              },
            ],
            as: 'last_message',
          },
        },
        {
          $unwind: {
            path: '$last_message',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$participants',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'participants.user_id',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  email: 1,
                  address: 1,
                  is_deleted: 1,
                  is_active: 1,
                },
              },
            ],
            as: 'participant_user',
          },
        },
        {
          $unwind: {
            path: '$participant_user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            'participants.user': '$participant_user',
          },
        },
        {
          $project: {
            participant_user: 0,
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            is_group_chat: { $first: '$is_group_chat' },
            created_by: { $first: '$created_by' },
            total_unread_messages: { $first: '$total_unread_messages' },
            last_message: { $first: '$last_message' },
            is_deleted: { $first: '$is_deleted' },
            is_active: { $first: '$is_active' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            participants: { $push: '$participants' },
          },
        },
      ];

      const conversations = await ConversationModel.aggregate(pipeline);
      const count = await ConversationModel.countDocuments({
        is_deleted: false,
        is_active: true,
      });

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.CONVERSATION_RETRIEVED_SUCCESS,
        data: {
          conversations,
          count,
        },
      });
    } catch (error) {
      console.error('Error in getConversations:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.CONVERSATION_RETRIEVE_ERROR,
        error: error.message,
      });
    }
  },
};
