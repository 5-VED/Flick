const socket_io = require('socket.io');
const jwt = require('jsonwebtoken');
const {
  UserModel,
  SessionModel,
  ConversationModel,
  MessageModel,
  ParticipantsModel,
} = require('../Models');
const ObjectId = require('mongoose').Types.ObjectId;
const { escapeRegExp } = require('../Utils/string.utils');
const { HTTP_CODES, USER_STATUS } = require('../Constants/enums');
const messages = require('../Constants/messages');

module.exports = async server => {
  const io = socket_io(server, {
    cors: { origin: ['*'] },
  });

  // JWT auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.headers['x-auth-token'];
    if (!token) return next(new Error('Authentication failed'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded._id) throw new Error('Unauthorized');

      const user = await UserModel.findOne({
        _id: decoded._id,
        is_active: true,
        is_deleted: false,
      }).populate('role');
      if (!user) throw new Error('Invalid Token');

      socket.user = { ...decoded, role: user?.role?.role, email: user?.email };
      return next();
    } catch (error) {
      return next(new Error('Internal Server Error'));
    }
  });

  io.on('connection', socket => {
    // ─── Authenticate ───────────────────────────────────────────────
    socket.on('authenticate', async payload => {
      try {
        const user_id = payload.user_id;
        const user = await UserModel.findOne({
          _id: user_id,
          is_active: true,
          is_deleted: false,
        }).populate('role');

        if (!user) {
          return socket.emit('auth_error', {
            status: HTTP_CODES.NOT_FOUND,
            message: messages.CHAT_USER_NOT_FOUND,
          });
        }

        await SessionModel.create({
          user_id,
          socket_id: socket.id,
          device_info: payload.device_info,
          ip_address: socket.handshake.address,
        });

        user.status = USER_STATUS.ONLINE;
        user.last_active_at = new Date();
        await user.save();

        socket.join(`user:${user_id}`);
        io.emit('user_status_changed', { user_id, status: USER_STATUS.ONLINE });

        socket.emit('auth_success', {
          status: HTTP_CODES.OK,
          message: messages.CHAT_AUTH_SUCCESS,
          data: { user },
        });
      } catch (error) {
        console.error('Error authenticating user:', error);
        socket.emit('error', { message: messages.CHAT_ERROR_INTERNAL });
      }
    });

    // ─── Room management ────────────────────────────────────────────
    socket.on('join_room', ({ conversation_id }) => {
      if (!conversation_id) return;
      socket.join(`conversation:${conversation_id}`);
      socket.emit('room_joined', { conversation_id });
    });

    socket.on('leave_room', ({ conversation_id }) => {
      if (!conversation_id) return;
      socket.leave(`conversation:${conversation_id}`);
    });

    // ─── Typing ─────────────────────────────────────────────────────
    socket.on('typing', ({ conversation_id, user_id }) => {
      if (!conversation_id) return;
      socket.to(`conversation:${conversation_id}`).emit('typing', {
        conversation_id,
        user_id,
      });
    });

    socket.on('stop_typing', ({ conversation_id, user_id }) => {
      if (!conversation_id) return;
      socket.to(`conversation:${conversation_id}`).emit('stop_typing', {
        conversation_id,
        user_id,
      });
    });

    // ─── Send message ────────────────────────────────────────────────
    socket.on('send-private-message', async payload => {
      try {
        let { content, participants: participantIds, conversation_id, name, reply_to, attachments } = payload;
        const senderId = socket?.user?._id;

        const message_payload = {
          sender: senderId,
          content: content,
          is_deleted: false,
          attachments: attachments || [],
          reply_to: reply_to || null,
        };

        let target_conversation_id = conversation_id;

        if (!target_conversation_id) {
          const validUsers = await UserModel.find({ _id: { $in: participantIds } }).select('_id');
          const participantDocs = await Promise.all(
            validUsers.map(u => ParticipantsModel.create({ user_id: u._id }))
          );

          const conversation = await ConversationModel.create({
            name,
            is_group_chat: participantIds.length > 2,
            created_by: senderId,
            participants: participantDocs.map(p => p._id),
            last_message: { content, sender: senderId, type: 'text', sent_at: new Date() },
          });

          target_conversation_id = conversation._id;
          socket.join(`conversation:${target_conversation_id}`);
        } else {
          await ConversationModel.findByIdAndUpdate(target_conversation_id, {
            last_message: { content, sender: senderId, type: 'text', sent_at: new Date() },
          });
          socket.join(`conversation:${target_conversation_id}`);

          if (!participantIds || participantIds.length === 0) {
            const conv = await ConversationModel.findById(target_conversation_id).populate('participants');
            if (conv) participantIds = conv.participants.map(p => p.user_id).filter(Boolean);
          }
        }

        const savedMsg = await MessageModel.create({
          conversation_id: target_conversation_id,
          ...message_payload,
        });

        // Populate reply_to for the response
        let msgData = savedMsg.toObject();
        if (savedMsg.reply_to) {
          const parent = await MessageModel.findById(savedMsg.reply_to).select('content sender').lean();
          msgData.replyToMsg = parent;
        }

        socket.to(`conversation:${target_conversation_id}`).emit('msg_recieve', {
          status: HTTP_CODES.OK,
          data: msgData,
        });

        if (participantIds?.length > 0) {
          participantIds.forEach(pid => {
            if (pid.toString() !== senderId.toString()) {
              socket.to(`user:${pid}`).emit('new_message_notification', {
                conversation_id: target_conversation_id,
                message: msgData,
              });
            }
          });
        }

        socket.emit('msg_sent', {
          status: HTTP_CODES.OK,
          message: messages.CHAT_MESSAGE_SENT,
          data: msgData,
          success: true,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: messages.CHAT_MESSAGE_FAILED });
      }
    });

    // ─── Delete message ─────────────────────────────────────────────
    socket.on('delete_message', async ({ message_id, conversation_id, delete_for_everyone }) => {
      try {
        const userId = socket.user._id;
        const msg = await MessageModel.findById(message_id);
        if (!msg) return;

        if (delete_for_everyone && msg.sender.toString() === userId.toString()) {
          await MessageModel.findByIdAndUpdate(message_id, {
            is_deleted: true,
            content: 'This message was deleted',
            reactions: [],
          });

          io.to(`conversation:${conversation_id}`).emit('message_deleted', {
            message_id,
            conversation_id,
            delete_for_everyone: true,
            content: 'This message was deleted',
          });
        } else {
          // Delete for me only
          await MessageModel.findByIdAndUpdate(message_id, {
            $addToSet: { is_deleted_for: userId },
          });
          socket.emit('message_deleted', {
            message_id,
            conversation_id,
            delete_for_everyone: false,
          });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: messages.CHAT_ERROR_INTERNAL });
      }
    });

    // ─── Edit message ────────────────────────────────────────────────
    socket.on('edit_message', async ({ message_id, content, conversation_id }) => {
      try {
        const userId = socket.user._id;
        const msg = await MessageModel.findOne({ _id: message_id, sender: userId });
        if (!msg) return socket.emit('error', { message: 'Cannot edit this message' });

        await MessageModel.findByIdAndUpdate(message_id, {
          content: content.trim(),
          is_edited: true,
        });

        io.to(`conversation:${conversation_id}`).emit('message_edited', {
          message_id,
          conversation_id,
          content: content.trim(),
        });

        socket.emit('edit_success', { message_id, content: content.trim(), success: true });
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: messages.CHAT_ERROR_INTERNAL });
      }
    });

    // ─── React to message ────────────────────────────────────────────
    socket.on('react_message', async ({ message_id, emoji, conversation_id }) => {
      try {
        const userId = socket.user._id;
        const msg = await MessageModel.findById(message_id);
        if (!msg) return;

        const existing = msg.reactions.find(r => r.user_id.toString() === userId.toString());

        if (existing) {
          if (existing.emoji === emoji) {
            // Toggle off
            msg.reactions = msg.reactions.filter(r => r.user_id.toString() !== userId.toString());
          } else {
            existing.emoji = emoji;
          }
        } else {
          msg.reactions.push({ user_id: userId, emoji });
        }

        await msg.save();

        io.to(`conversation:${conversation_id}`).emit('reaction_updated', {
          message_id,
          conversation_id,
          reactions: msg.reactions,
        });
      } catch (error) {
        console.error('Error reacting to message:', error);
        socket.emit('error', { message: messages.CHAT_ERROR_INTERNAL });
      }
    });

    // ─── Mark conversation as read ───────────────────────────────────
    socket.on('mark_read', async ({ conversation_id }) => {
      try {
        const userId = socket.user._id;
        const conversation = await ConversationModel.findById(conversation_id).populate('participants');
        if (!conversation) return;

        const participantObj = conversation.participants.find(
          p => p.user_id?.toString() === userId.toString()
        );

        if (participantObj) {
          const lastMsg = await MessageModel.findOne(
            { conversation_id, is_deleted: false },
            null,
            { sort: { createdAt: -1 } }
          );
          if (lastMsg) {
            await ParticipantsModel.findByIdAndUpdate(participantObj._id, {
              last_read_message_id: lastMsg._id,
            });
          }
        }

        await ConversationModel.findByIdAndUpdate(conversation_id, {
          $set: { total_unread_messages: 0 },
        });

        socket.emit('marked_read', { conversation_id, success: true });

        socket.to(`conversation:${conversation_id}`).emit('read_receipt_updated', {
          conversation_id,
          user_id: userId,
        });
      } catch (error) {
        console.error('Error marking read:', error);
      }
    });

    // ─── Read receipt (legacy - mark specific message) ────────────────
    socket.on('recieve_message', async payload => {
      try {
        const { conversation_id, message_id } = payload;
        const userId = socket?.user?._id;

        const conversation = await ConversationModel.findById(conversation_id).populate('participants');
        if (!conversation) return;

        const participantObj = conversation.participants.find(
          p => p.user_id.toString() === userId.toString()
        );

        if (participantObj) {
          await ParticipantsModel.findByIdAndUpdate(participantObj._id, {
            last_read_message_id: message_id,
          });

          socket.to(`conversation:${conversation_id}`).emit('read_receipt_updated', {
            conversation_id,
            user_id: userId,
            last_read_message_id: message_id,
          });

          socket.emit('msg_delivered', { status: HTTP_CODES.OK, success: true });
        }
      } catch (error) {
        console.error('Error in recieve_message:', error);
      }
    });

    // ─── Message history ─────────────────────────────────────────────
    socket.on('history', async ({ page = 1, limit = 50, search = '', conversation_id }) => {
      try {
        if (!conversation_id) {
          return socket.emit('conversation_not_found', {
            status: HTTP_CODES.NOT_FOUND,
            message: messages.CHAT_CONVERSATION_NOT_FOUND,
          });
        }

        const userId = socket.user._id;

        let criteria = {
          conversation_id: new ObjectId(conversation_id),
          is_deleted: false,
          is_active: true,
          is_deleted_for: { $nin: [new ObjectId(userId)] },
        };

        if (search) {
          criteria.content = { $regex: escapeRegExp(search), $options: 'i' };
        }

        const msgList = await MessageModel.aggregate([
          { $match: criteria },
          {
            $lookup: {
              from: 'User_Master',
              localField: 'sender',
              foreignField: '_id',
              pipeline: [
                { $project: { first_name: 1, last_name: 1, profile_pic: 1, status: 1 } },
              ],
              as: 'senderInfo',
            },
          },
          { $unwind: { path: '$senderInfo', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'Message_Master',
              localField: 'reply_to',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'User_Master',
                    localField: 'sender',
                    foreignField: '_id',
                    pipeline: [{ $project: { first_name: 1, last_name: 1 } }],
                    as: 'senderInfo',
                  },
                },
                { $unwind: { path: '$senderInfo', preserveNullAndEmptyArrays: true } },
                { $project: { content: 1, sender: 1, senderInfo: 1 } },
              ],
              as: 'replyToMsg',
            },
          },
          { $unwind: { path: '$replyToMsg', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'Attachment_Master',
              localField: 'attachments',
              foreignField: '_id',
              pipeline: [
                { $project: { file_name: 1, file_type: 1, file_url: 1, file_size: 1 } },
              ],
              as: 'attachmentDocs',
            },
          },
          {
            $project: {
              sender: 1,
              senderInfo: 1,
              content: 1,
              createdAt: 1,
              is_edited: 1,
              is_favourite: 1,
              is_deleted: 1,
              reply_to: 1,
              replyToMsg: 1,
              reactions: 1,
              attachmentDocs: 1,
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]);

        const count = await MessageModel.countDocuments(criteria);

        socket.emit('msg_list', {
          status: HTTP_CODES.OK,
          success: true,
          data: { count, messages: msgList },
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        socket.emit('error', { message: messages.CHAT_ERROR_INTERNAL });
      }
    });

    // ─── Filter conversations ─────────────────────────────────────────
    socket.on('filter_conversation', async ({ page = 1, limit = 10, unread, group }) => {
      try {
        const userId = socket?.user?._id;
        const userParticipants = await ParticipantsModel.find({ user_id: userId }).select('_id');
        const userParticipantIds = userParticipants.map(p => p._id);

        let filter = {
          participants: { $in: userParticipantIds },
          is_deleted: false,
          is_active: true,
        };

        if (unread) filter.total_unread_messages = { $gt: 0 };
        if (group) filter.is_group_chat = true;

        const convs = await ConversationModel.find(filter)
          .skip((page - 1) * limit)
          .limit(limit);
        const count = await ConversationModel.countDocuments(filter);

        socket.emit('filtered_conversation', {
          status: HTTP_CODES.OK,
          message: messages.CHAT_CONVERSATION_FILTERED,
          data: { result: convs, count },
          success: true,
        });
      } catch (error) {
        console.error('Error filtering conversations:', error);
        socket.emit('error', { message: messages.CHAT_ERROR_INTERNAL });
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        if (!socket.user?._id) return;
        const userId = socket.user._id;

        const [, , remainingSessions] = await Promise.all([
          SessionModel.deleteOne({ socket_id: socket.id }).catch(() => null),
          UserModel.findByIdAndUpdate(userId, {
            $set: { status: USER_STATUS.OFFLINE, last_active_at: new Date() },
          }).catch(() => null),
          SessionModel.countDocuments({ user_id: userId }).catch(() => 0),
        ]);

        if (remainingSessions === 0) {
          socket.broadcast.emit('user_status_changed', {
            user_id: userId,
            status: USER_STATUS.OFFLINE,
            last_active_at: new Date(),
          });
        }
      } catch (error) {
        console.error('Error in disconnect handler:', error);
      }
    });

    io.on('error', error => console.error('Socket.IO error:', error));
  });
};
