import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { Search, Plus, X, ArrowLeft, Users, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import GroupCreateModal from './GroupCreateModal';

const Sidebar = ({ selectedConversation, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const searchTimeout = useRef(null);
  const menuRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversation/get-all');
      setConversations(response.data.data?.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const socket = getSocket();
    if (socket) {
      const onNewMsg = () => fetchConversations();
      socket.on('new_message_notification', onNewMsg);
      return () => socket.off('new_message_notification', onNewMsg);
    }
  }, []);

  // Close the + menu on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowNewMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search users for new chat
  useEffect(() => {
    if (!showNewChat) return;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const res = await api.get('/user/list', { params: { search: userSearch, limit: 20 } });
        setUserResults(res.data.data || []);
      } catch {
        setUserResults([]);
      } finally {
        setUserSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [userSearch, showNewChat]);

  const handleSelectUser = user => {
    // Check if a direct conversation with this user already exists
    const existing = conversations.find(conv => {
      if (conv.is_group_chat) return false;
      return conv.participants?.some(
        p => (p.user_id?._id || p.user?._id || p.user_id)?.toString() === user._id?.toString()
      );
    });

    if (existing) {
      onSelectConversation(existing);
    } else {
      // Start a new conversation (no _id yet — created on first message)
      onSelectConversation({
        _isNew: true,
        name: `${user.first_name} ${user.last_name}`.trim(),
        is_group_chat: false,
        participants: [
          { user_id: currentUser._id, user: currentUser },
          { user_id: user._id, user },
        ],
      });
    }

    setShowNewChat(false);
    setUserSearch('');
    setUserResults([]);
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConvDisplayName(conv, currentUser?._id);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (showNewChat) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
          <button
            onClick={() => { setShowNewChat(false); setUserSearch(''); setUserResults([]); }}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">New Chat</h1>
        </div>
        <div className="p-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="Search people..."
              className="w-full bg-gray-100 placeholder-gray-500 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {userSearchLoading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
          ) : userResults.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              {userSearch ? 'No users found' : 'Start typing to search'}
            </div>
          ) : (
            userResults.map(u => (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3 flex-shrink-0 text-sm">
                  {u.first_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {u.first_name} {u.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className={clsx(
                  'ml-auto w-2 h-2 rounded-full',
                  u.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                )} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
  <>
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Chats</h1>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowNewMenu(v => !v)}
            className="p-2 rounded-full hover:bg-gray-100 text-primary transition-colors"
            title="New chat"
          >
            <Plus size={20} />
          </button>
          {showNewMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-44 z-30">
              <button
                onClick={() => { setShowNewMenu(false); setShowNewChat(true); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare size={15} className="text-primary" />
                New Chat
              </button>
              <button
                onClick={() => { setShowNewMenu(false); setShowGroupModal(true); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Users size={15} className="text-primary" />
                New Group
              </button>
            </div>
          )}
        </div>
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            {searchTerm ? 'No results' : 'No conversations yet. Start a new chat!'}
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isSelected =
              selectedConversation && selectedConversation._id === conv._id;
            const displayName = getConvDisplayName(conv, currentUser?._id);
            const lastMsg = conv.last_message?.content || '';
            const time = conv.last_message?.sent_at
              ? format(new Date(conv.last_message.sent_at), 'HH:mm')
              : '';
            const unread = conv.total_unread_messages || 0;

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={clsx(
                  'flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors',
                  isSelected && 'bg-blue-50 hover:bg-blue-50'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{displayName}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{lastMsg}</p>
                    {unread > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {showGroupModal && (
      <GroupCreateModal
        onClose={() => setShowGroupModal(false)}
        onGroupCreated={conv => {
          setShowGroupModal(false);
          fetchConversations();
          onSelectConversation(conv);
        }}
      />
    )}
  </>
  );
};

function getConvDisplayName(conv, currentUserId) {
  if (conv.is_group_chat) return conv.name || 'Group Chat';
  const other = conv.participants?.find(
    p => (p.user_id?._id || p.user?._id || p.user_id)?.toString() !== currentUserId?.toString()
  );
  const u = other?.user || other;
  if (u?.first_name) return `${u.first_name} ${u.last_name || ''}`.trim();
  return conv.name || 'Chat';
}

export default Sidebar;
