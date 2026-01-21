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
    cors: {
      origin: ['*'],
    },
  });

  // Check authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.headers['x-auth-token'];

    if (!token) return next(new Error('Authentication failed'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded._id) {
        throw new Error('Unauthorized');
      }

      const user = await UserModel.findOne({
        _id: decoded._id,
        is_active: true,
        is_deleted: false,
      }).populate('role');
      if (!user) {
        throw new Error('Invalid Token');
      }

      socket.user = {
        ...decoded,
        role: user?.role?.role,
        email: user?.email,
      };

      return next();
    } catch (error) {
      console.log('Error authenticating user', error);
      return next(new Error('Internal Server Error'));
    }
  });

  // Connect to sockets
  io.on('connection', socket => {
    // Authenticate user
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
            data: {},
          });
        }

        // Create session
        await SessionModel.create({
          user_id,
          socket_id: socket.id,
          device_info: payload.device_info,
          ip_address: socket.handshake.address,
        });

        user.status = USER_STATUS.ONLINE;
        user.last_active_at = new Date();
        await user.save();

        user.status = USER_STATUS.ONLINE;
        user.last_active_at = new Date();
        await user.save();

        // Optimization: Do NOT join all conversation rooms.
        // We will notify users via their personal room "user:{user_id}"
        // or join only when they enter a chat screen.
        socket.join(`user:${user_id}`);

        console.log(`User ${user_id} authenticated and joined personal room`);

        console.log(socket.user._id);

        // Broadcast to all the connected sockets
        io.emit('user_status_changed', { user_id: user_id, status: USER_STATUS.ONLINE });

        socket.emit('auth_success', {
          status: HTTP_CODES.OK,
          message: messages.CHAT_AUTH_SUCCESS,
          data: { user },
        });
      } catch (error) {
        console.error('Error authenticating user:', error);
        socket.emit('error', {
          status: HTTP_CODES.INTERNAL_SERVER_ERROR,
          message: messages.CHAT_ERROR_INTERNAL,
          data: {},
        });
      }
    });

    socket.on('typing', ({ conversation_id, user_id }) => {
      if (!conversation_id) {
        return socket.emit('conversation_not_found', {
          status: HTTP_CODES.NOT_FOUND,
          message: messages.CHAT_CONVERSATION_NOT_FOUND,
        });
      }

      socket.to(conversation_id).emit('typing', {
        conversation_id,
        user_id,
        message: messages.CHAT_TYPING_STARTED,
      });
    });

    // Send message
    socket.on('send-private-message', async payload => {
      try {
        const { content, participants: participantIds, conversation_id, name } = payload;
        const senderId = socket?.user?._id;

        const message_payload = {
          sender: senderId,
          content: content,
          // Removed read_by/delivered_to arrays for scalability
          is_deleted: false,
          attachments: payload?.attachments || [],
        };

        let target_conversation_id = conversation_id;

        // 1. Validate / Create Participants (Fix N+1)
        // If creating a new conversation, we need participant docs
        let participantDocs = [];

        // Optimize: Check if conversation exists (if not passed)
        if (!target_conversation_id) {
          // Bulk fetch users to ensure they exist
          const validUsers = await UserModel.find({ _id: { $in: participantIds } }).select('_id');

          if (validUsers.length !== participantIds.length) {
            // Some users invalid
          }

          // Create Participant documents in parallel
          participantDocs = await Promise.all(
            validUsers.map(u => ParticipantsModel.create({ user_id: u._id }))
          );

          const participantRefIds = participantDocs.map(p => p._id);

          const conversation_payload = {
            name: name,
            is_group_chat: participantIds.length > 2, // Logic update: >2 usually implies group in many apps, but let's stick to payload or default
            created_by: senderId,
            participants: participantRefIds,
            last_message: {
              content: content,
              sender: senderId,
              type: 'text',
              sent_at: new Date(),
            },
          };

          const conversation = await ConversationModel.create(conversation_payload);
          target_conversation_id = conversation._id;

          // Join this socket to the new conversation room
          socket.join(`conversation:${target_conversation_id}`);
        } else {
          // Update last message
          await ConversationModel.findByIdAndUpdate(target_conversation_id, {
            last_message: {
              content: content,
              sender: senderId,
              type: 'text',
              sent_at: new Date(),
            },
          });
        }

        // 2. Create Message
        const response = await MessageModel.create({
          conversation_id: target_conversation_id,
          ...message_payload,
        });

        // 3. Update Sender's Read Status (Implicitly read their own message)
        // Find participant record for sender in this conversation
        // This is complex without linking participant to conversation easily.
        // For now, we emit the message.

        // Emit to conversation room (if anyone is listening)
        io.to(`conversation:${target_conversation_id}`).emit('msg_recieve', {
          status: HTTP_CODES.OK,
          message: messages.CHAT_MESSAGE_RECEIVED,
          data: response,
        });

        // Also emit to specific user rooms (Push Notification style)
        participantIds.forEach(pid => {
          if (pid.toString() !== senderId.toString()) {
            socket.to(`user:${pid}`).emit('new_message_notification', {
              conversation_id: target_conversation_id,
              message: response,
            });
          }
        });

        socket.emit('msg_sent', {
          status: HTTP_CODES.OK,
          message: messages.CHAT_MESSAGE_SENT,
          data: response,
          success: true,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', {
          status: HTTP_CODES.INTERNAL_SERVER_ERROR,
          message: messages.CHAT_MESSAGE_FAILED,
          data: {},
        });
      }
    });

    // Socket event to stop typing
    socket.on('stop_typing', ({ conversation_id, user_id }) => {
      socket.to(conversation_id).emit('stop_typing', { conversation_id, user_id });
    });

    // Receive Message / Read Receipt Update
    socket.on('recieve_message', async payload => {
      try {
        const { conversation_id, message_id } = payload;
        const user_id = socket?.user?._id;

        // Optimization: Don't read all messages. Just mark the point we read up to.

        // 1. Find the conversation to get the participant ID for this user
        // Note: This data model (Conversation -> [Participants] -> Users) makes lookup hard.
        // Ideally we need: ParticipantsModel.findOne({ user_id: user_id, conversation_id: ... })
        // But Participants doesn't have conversation_id! It's embedded in Conversation.
        // We have to fallback to finding conversation first.

        const conversation =
          await ConversationModel.findById(conversation_id).populate('participants');

        if (!conversation) {
          return socket.emit('error', {
            status: HTTP_CODES.NOT_FOUND,
            message: 'Conversation not found',
          });
        }

        const participantObj = conversation.participants.find(
          p => p.user_id.toString() === user_id.toString()
        );

        if (participantObj) {
          // Update the Participant document directly
          await ParticipantsModel.findByIdAndUpdate(participantObj._id, {
            last_read_message_id: message_id,
            // last_read_at: new Date() // if we had this
          });

          // Notify others in the room that this user has read up to this message
          socket.to(`conversation:${conversation_id}`).emit('read_receipt_updated', {
            conversation_id,
            user_id,
            last_read_message_id: message_id,
          });

          socket.emit('msg_delivered', {
            status: HTTP_CODES.OK,
            success: true,
            message: 'Read status updated',
          });
        }
      } catch (error) {
        console.error('Error in recieve_message:', error);
        socket.emit('error', {
          status: HTTP_CODES.INTERNAL_SERVER_ERROR,
          message: messages.CHAT_ERROR_INTERNAL,
          data: {},
        });
      }
    });

    // Event to retrive history of a conversation
    socket.on('history', async ({ page = 1, limit = 10, search = '', conversation_id }) => {
      try {
        if (!conversation_id) {
          socket.emit('conversation_not_found', {
            status: HTTP_CODES.NOT_FOUND,
            data: {},
            message: messages.CHAT_CONVERSATION_NOT_FOUND,
          });
          return;
        }

        let criteria = {
          conversation_id: new ObjectId(conversation_id),
          is_deleted: false,
          is_active: true,
        };

        if (search !== '') {
          const sanitizedSearch = escapeRegExp(search);
          criteria = {
            ...criteria,
            content: { $regex: sanitizedSearch, $options: 'i' },
          };
        }

        if (!conversation_id) {
          socket.emit('conversation_not_found', {
            status: HTTP_CODES.NOT_FOUND,
            data: {},
            message: messages.CHAT_CONVERSATION_NOT_FOUND,
          });
          return;
        }

        const messages = await MessageModel.aggregate([
          {
            $match: criteria,
          },
          {
            $lookup: {
              from: 'User_Master',
              localField: 'sender',
              foreignField: '_id',
              pipeline: [
                {
                  $project: {
                    first_name: 1,
                    last_name: 1,
                    phone: 1,
                    profile_pic: 1,
                  },
                },
              ],
              as: 'senderInfo',
            },
          },
          {
            $unwind: {
              path: '$senderInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              senderInfo: 1,
              content: 1,
              created_at: 1,
              is_edited: 1,
              is_favourite: 1,
            },
          },
          {
            $sort: { created_at: -1 },
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ]);

        const count = await MessageModel.countDocuments(criteria);

        if (!messages) {
          socket.emit('msg_list', { status: HTTP_CODES.OK, success: true, data: [] });
          return;
        }

        socket.emit('msg_list', {
          status: HTTP_CODES.OK,
          success: true,
          data: { count, messages },
        });
      } catch (error) {
        console.error('Error Fetching Messages =>', error);
        socket.emit('error', {
          status: HTTP_CODES.INTERNAL_SERVER_ERROR,
          message: messages.CHAT_ERROR_INTERNAL,
          data: {},
        });
      }
    });

    // Filter Conversations and add custom Filters
    socket.on(
      'filter_conversation',
      async ({ page = 1, limit = 10, unread, all, group, favourites }) => {
        try {
          // Custom fileters
          let filter = {};

          if (unread) {
            filter = { ...filter, total_unread_messages: { $gt: 0 } };
          }

          if (all) {
            filter = { ...filter, is_deleted: false, is_active: true };
          }

          if (group) {
            filter = { ...filter, is_group_chat: true };
          }

          if (favourites) {
            // filter = { ...filter, is_group_chat: true }
          }

          const conversations = await ConversationModel.find({ filter })
            .skip(page - 1 * limit)
            .limit(limit);
          const count = await ConversationModel.countDocuments(filter);

          socket.emit('filtered_conversation', {
            status: HTTP_CODES.OK,
            message: messages.CHAT_CONVERSATION_FILTERED,
            data: { result: conversations, count },
            success: true,
          });
        } catch (error) {
          console.error('Error filtering conversations:', error);
          socket.emit('error', {
            status: HTTP_CODES.INTERNAL_SERVER_ERROR,
            message: messages.CHAT_ERROR_INTERNAL,
            data: {},
          });
        }
      }
    );

    socket.on('disconnect', async reason => {
      try {
        console.log(`=== SOCKET DISCONNECT START ===`);
        console.log(`Socket ID: ${socket.id}`);
        console.log(`Disconnect reason: ${reason}`);
        console.log(`User data:`, socket.user);

        // Check if user exists
        if (!socket.user?._id) {
          console.log('No authenticated user found for disconnecting socket');
          return;
        }

        const userId = socket.user._id;
        console.log(`Processing disconnect for user: ${userId}`);

        // Perform cleanup operations
        const cleanupPromises = [];

        // 1. Delete session
        cleanupPromises.push(
          SessionModel.deleteOne({ socket_id: socket.id })
            .then(result => {
              console.log(`Session cleanup result:`, result);
              return result;
            })
            .catch(err => {
              console.error('Session cleanup failed:', err);
              return null;
            })
        );

        // 2. Update user status to offline
        cleanupPromises.push(
          UserModel.findByIdAndUpdate(
            userId,
            {
              $set: {
                status: USER_STATUS.OFFLINE,
                last_active_at: new Date(),
              },
            },
            { new: true }
          )
            .then(result => {
              console.log(`User status updated:`, result ? 'Success' : 'Failed');
              return result;
            })
            .catch(err => {
              console.error('User status update failed:', err);
              return null;
            })
        );

        // 3. Check if user has other active sessions
        cleanupPromises.push(
          SessionModel.countDocuments({ user_id: userId })
            .then(count => {
              console.log(`Remaining sessions for user ${userId}: ${count}`);
              return count;
            })
            .catch(err => {
              console.error('Session count check failed:', err);
              return 0;
            })
        );

        // Execute all cleanup operations
        const [sessionResult, userResult, remainingSessions] = await Promise.all(cleanupPromises);

        // Only broadcast offline status if no other sessions exist
        if (remainingSessions === 0) {
          console.log(`Broadcasting offline status for user: ${userId}`);

          // Use socket.broadcast instead of io.emit to avoid sending to disconnected socket
          socket.broadcast.emit('user_status_changed', {
            user_id: userId,
            status: USER_STATUS.OFFLINE,
            message: messages.CHAT_USER_OFFLINE,
            last_active_at: new Date(),
          });
        } else {
          console.log(`User ${userId} still has ${remainingSessions} active sessions`);
        }

        // Optional: Leave conversation rooms (if you're using rooms)
        const socketRooms = Array.from(socket.rooms);
        console.log(`Socket was in rooms:`, socketRooms);

        socketRooms.forEach(room => {
          if (room !== socket.id) {
            // Don't leave the default room (socket.id)
            socket.leave(room);
            console.log(`Left room: ${room}`);
          }
        });

        console.log(`=== DISCONNECT CLEANUP COMPLETED FOR USER: ${userId} ===`);
      } catch (error) {
        console.error('=== ERROR IN DISCONNECT HANDLER ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
      }
    });

    // Move this outside the connection handler
    io.on('error', error => {
      console.error('Socket.IO error:', error);
    });
  });
};
