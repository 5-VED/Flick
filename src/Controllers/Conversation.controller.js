const { ConversationModel, ParticipantsModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');
const ObjectId = require('mongoose').Types.ObjectId;

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

      const conversation = await ConversationModel.findOne({ name, is_deleted: false });

      if (!conversation) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.CONVERSATION_NOT_FOUND,
        });
      }

      await ConversationModel.findByIdAndUpdate(
        conversation._id,
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

  getOrCreateDirectConversation: async (req, res) => {
    try {
      const { target_user_id } = req.query;
      const currentUserId = req.user._id;

      if (!target_user_id) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: 'target_user_id is required',
        });
      }

      const [currentUserParticipants, targetUserParticipants] = await Promise.all([
        ParticipantsModel.find({ user_id: currentUserId }).select('_id'),
        ParticipantsModel.find({ user_id: new ObjectId(target_user_id) }).select('_id'),
      ]);

      let conversation = null;

      if (currentUserParticipants.length > 0 && targetUserParticipants.length > 0) {
        conversation = await ConversationModel.findOne({
          is_group_chat: false,
          is_deleted: false,
          is_active: true,
          $and: [
            { participants: { $in: currentUserParticipants.map(p => p._id) } },
            { participants: { $in: targetUserParticipants.map(p => p._id) } },
          ],
        });
      }

      if (!conversation) {
        const [currentParticipant, targetParticipant] = await Promise.all([
          ParticipantsModel.create({ user_id: currentUserId }),
          ParticipantsModel.create({ user_id: new ObjectId(target_user_id) }),
        ]);

        conversation = await ConversationModel.create({
          is_group_chat: false,
          created_by: currentUserId,
          participants: [currentParticipant._id, targetParticipant._id],
        });
      }

      const [populatedConv] = await ConversationModel.aggregate([
        { $match: { _id: conversation._id } },
        {
          $lookup: {
            from: 'Participants',
            localField: 'participants',
            foreignField: '_id',
            pipeline: [
              {
                $lookup: {
                  from: 'User_Master',
                  localField: 'user_id',
                  foreignField: '_id',
                  pipeline: [{ $project: { _id: 1, first_name: 1, last_name: 1, profile_pic: 1, status: 1, email: 1 } }],
                  as: 'user',
                },
              },
              { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
              { $project: { _id: 1, user_id: 1, user: 1, is_admin: 1 } },
            ],
            as: 'participants',
          },
        },
      ]);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: 'Conversation ready',
        data: populatedConv || conversation,
      });
    } catch (error) {
      console.error('Error in getOrCreateDirectConversation:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getConversations: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Scope to current user's conversations
      const userParticipants = await ParticipantsModel.find({
        user_id: req.user._id,
      }).select('_id');
      const userParticipantIds = userParticipants.map(p => p._id);

      const pipeline = [
        {
          $match: {
            participants: { $in: userParticipantIds },
            is_deleted: false,
            is_active: true,
          },
        },
        { $sort: { 'last_message.sent_at': -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'Participants',
            localField: 'participants',
            foreignField: '_id',
            pipeline: [
              {
                $lookup: {
                  from: 'User_Master',
                  localField: 'user_id',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        first_name: 1,
                        last_name: 1,
                        profile_pic: 1,
                        status: 1,
                        email: 1,
                      },
                    },
                  ],
                  as: 'user',
                },
              },
              { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
              { $project: { _id: 1, user_id: 1, user: 1, is_admin: 1 } },
            ],
            as: 'participants',
          },
        },
      ];

      const conversations = await ConversationModel.aggregate(pipeline);
      const count = await ConversationModel.countDocuments({
        participants: { $in: userParticipantIds },
        is_deleted: false,
        is_active: true,
      });

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.CONVERSATION_RETRIEVED_SUCCESS,
        data: { conversations, count },
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
