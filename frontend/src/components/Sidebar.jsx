import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { Search, Plus } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const Sidebar = ({ selectedConversation, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    try {
      // Using the backend socket filter_conversation or api/conversation/get
      // The socket logic in chat.js: socket.on('filter_conversation', ...) -> socket.emit('filtered_conversation')
      // Let's try HTTP first if available, else socket.
      // Routes file showed router.get('/get', ...) -> ConversationController.getConversation
      const response = await api.get('/conversation/get');
      // The controller likely returns the list.
      // If the backend returns wrapped data, adjust accordingly.
      // Assuming response.data.data or similar.
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      // Fallback: try socket if HTTP fails or returns empty?
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    if (socket) {
      socket.on('new_message_notification', data => {
        // Refresh conversations or move the updated one to top
        // Ideally we fetch again or update state locally
        fetchConversations();
      });
    }

    return () => {
      if (socket) socket.off('new_message_notification');
    };
  }, []);

  const filteredConversations = conversations.filter(
    c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.participants?.some(p =>
        p.user_id?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Chats</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 text-primary">
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-100 placeholder-gray-500 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          filteredConversations.map(conv => {
            const isSelected = selectedConversation && selectedConversation._id === conv._id;
            // Name logic: if group, use name. If private, use other user's name.
            // Simplified logic for now.
            const displayName = conv.name || 'Unknown User';
            const lastMsg = conv.last_message?.content || '';
            const time = conv.last_message?.sent_at
              ? format(new Date(conv.last_message.sent_at), 'HH:mm')
              : '';

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={clsx(
                  'flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors',
                  isSelected && 'bg-blue-50 hover:bg-blue-50'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 mr-3">
                  {/* Avatar logic */}
                  {conv.group_avatar ? (
                    <img
                      src={conv.group_avatar}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-primary rounded-full font-bold">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{lastMsg}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
