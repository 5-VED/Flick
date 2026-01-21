import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';
import api from '../services/api'; // If we have message history API, otherwise use socket 'history'
import MessageBubble from './MessageBubble';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch history when conversation changes
  useEffect(() => {
    if (!conversation) return;

    setLoading(true);
    setMessages([]); // Clear previous messages

    const socket = getSocket();
    if (socket) {
      // Join conversation room if logic requires it, usually handled by backend or auto-join
      // Backend chat.js: socket.on('send-private-message') joins implicitly if new.
      // But for existing, we might need to join or assume 'new_message_notification' comes to 'user:id'.
      // Backend line 212: io.to(`conversation:${target_conversation_id}`)
      // Frontend doesn't explicitly 'join' conversation room in chat.js logic shown?
      // Wait, backend line 187: socket.join(conversation:${target_conversation_id}) is only when CREATING.
      // WE NEED TO JOIN THE ROOM.
      // But there is no 'join_room' event in backend!
      // The backend logic seems to assume users are in rooms? OR it sends to user room?
      // Line 219: socket.to(`user:${pid}`).emit('new_message_notification', ...)
      // So it sends to USER room. That's fine.

      // Fetch history via socket 'history' event
      socket.emit('history', { conversation_id: conversation._id, page: 1, limit: 50 });

      const handleMsgList = response => {
        if (response.success) {
          // Messages from backend are often reverse chronological or chronological.
          // Backend sort: { created_at: -1 } (descending).
          // We need to reverse them for display (ascending).
          const msgs = response.data.messages || [];
          setMessages(msgs.reverse());
        }
        setLoading(false);
      };

      const handleNewMsg = payload => {
        // payload: { conversation_id, message }
        if (payload.conversation_id === conversation._id) {
          setMessages(prev => [...prev, payload.message]);
        }
      };

      const handleMsgReceive = payload => {
        // If we are in the room (implying logic exists?), but we rely on user room notif?
        // Let's listen to both 'msg_recieve' (if in room) and 'new_message_notification' (user room)
        // Adjust payload structure check
        const msg = payload.data || payload.message; // 'msg_recieve' has .data = message
        // Check structure from backend line 212-215
        if (msg) {
          // In case we receive it via room
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on('msg_list', handleMsgList);
      socket.on('new_message_notification', handleNewMsg);
      // socket.on('msg_recieve', handleMsgReceive); // Need to join room for this

      return () => {
        socket.off('msg_list', handleMsgList);
        socket.off('new_message_notification', handleNewMsg);
        // socket.off('msg_recieve', handleMsgReceive);
      };
    }
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = e => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const socket = getSocket();
    if (socket) {
      // Backend expects 'send-private-message' with payload
      const payload = {
        content: inputValue,
        conversation_id: conversation._id,
        participants: conversation.participants.map(p => p.user_id || p), // Ensure just IDs
        name: conversation.name,
      };

      socket.emit('send-private-message', payload);

      // Optimistic update? Or wait for 'msg_sent'?
      // Backend line 228 emits 'msg_sent' to sender.
      const handleSent = response => {
        if (response.success) {
          setMessages(prev => [...prev, response.data]);
        }
        socket.off('msg_sent', handleSent);
      };
      socket.on('msg_sent', handleSent);

      setInputValue('');
    }
  };

  // Header name logic
  const displayName = conversation.name || 'Chat';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white flex items-center px-6 shadow-sm z-10">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">
          {displayName.charAt(0)}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{displayName}</h2>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#e5ddd5]/10">
        {' '}
        {/* Subtle WhatsApp-like bg tint or just gray-50 */}
        {loading ? (
          <div className="text-center text-gray-400 mt-10">Loading messages...</div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg._id || idx}
              message={msg}
              isMe={msg.sender === user?._id || msg.sender?._id === user?._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <Smile size={24} />
          </button>
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip size={24} />
          </button>
          <input
            type="text"
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
            placeholder="Type a message..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            className={clsx(
              'p-2 rounded-full transition-colors',
              inputValue.trim()
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-400 cursor-default'
            )}
            disabled={!inputValue.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
