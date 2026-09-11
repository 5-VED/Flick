import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { X, Search, Check, Users } from 'lucide-react';
import clsx from 'clsx';
import './GroupCreateModal.css';

const GroupCreateModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchTimeout = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/user/list', { params: { search, limit: 30 } });
        setUsers(res.data.data || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const toggleUser = user => {
    setSelected(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selected.length < 2) return;
    setCreating(true);

    const socket = getSocket();
    if (!socket) return;

    const participantIds = [currentUser._id, ...selected.map(u => u._id)];

    socket.once('msg_sent', response => {
      setCreating(false);
      if (response.success) {
        onGroupCreated?.({
          _id: response.data.conversation_id?.toString(),
          name: groupName.trim(),
          is_group_chat: true,
          participants: participantIds.map(id => ({ user_id: id })),
        });
        onClose();
      }
    });

    // Send first system message to create the conversation
    socket.emit('send-private-message', {
      content: `${currentUser.first_name} created the group`,
      conversation_id: null,
      participants: participantIds,
      name: groupName.trim(),
    });
  };

  return (
    <div className="groupmodal-backdrop">
      <div className="groupmodal-card">
        {/* Header */}
        <div className="groupmodal-header">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-primary" />
            <h2 className="font-bold text-gray-800 text-lg">New Group</h2>
          </div>
          <button onClick={onClose} className="groupmodal-close">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Group name */}
        <div className="px-4 pt-4 pb-2">
          <input
            autoFocus
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="groupmodal-input"
          />
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-1.5">
            {selected.map(u => (
              <span
                key={u._id}
                className="groupmodal-chip"
              >
                {u.first_name}
                <button
                  onClick={() => toggleUser(u)}
                  className="ml-1 hover:text-primary-dark"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Add participants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="groupmodal-input"
              style={{ paddingLeft: '2rem' }}
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-4">Searching...</div>
          ) : (
            users.map(u => {
              const isSelected = selected.some(s => s._id === u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleUser(u)}
                  className="groupmodal-user-row"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                    {u.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className={clsx(
                    'groupmodal-check',
                    isSelected && 'is-on'
                  )}>
                    {isSelected && <Check size={11} className="text-white" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 text-center">
            {selected.length} participant{selected.length !== 1 ? 's' : ''} selected (min. 2)
          </p>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selected.length < 2 || creating}
            className={clsx(
              'groupmodal-create-btn',
              groupName.trim() && selected.length >= 2
                ? 'is-ready'
                : 'is-disabled'
            )}
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;
