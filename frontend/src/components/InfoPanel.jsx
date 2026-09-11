import React from 'react';
import { X, Phone, Mail, Users, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './InfoPanel.css';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

const InfoPanel = ({ conversation, onClose }) => {
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const otherParticipants = conversation.participants?.filter(
    p => (p.user_id?._id || p.user?._id || p.user_id)?.toString() !== currentUser?._id?.toString()
  ) || [];

  const isGroup = conversation.is_group_chat;
  const firstOther = otherParticipants[0];
  const peerUser = firstOther?.user || firstOther;

  const displayName = isGroup
    ? (conversation.name || 'Group Chat')
    : (peerUser ? `${peerUser.first_name || ''} ${peerUser.last_name || ''}`.trim() : 'Chat');

  const initials = displayName.charAt(0).toUpperCase();
  const statusColor = peerUser?.status === 'online' ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className="infopanel-root">
      {/* Header */}
      <div className="infopanel-header">
        <h3 className="font-semibold text-gray-800">{isGroup ? 'Group Info' : 'Contact Info'}</h3>
        <button
          onClick={onClose}
          className="infopanel-close"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar & name */}
        <div className="infopanel-hero">
          <div className="relative">
            {(isGroup ? conversation.group_avatar : peerUser?.profile_pic) ? (
              <img
                src={`${BACKEND_URL}${isGroup ? conversation.group_avatar : peerUser.profile_pic}`}
                alt={displayName}
                className="infopanel-avatar"
              />
            ) : (
              <div className="infopanel-avatar-fallback">
                {initials}
              </div>
            )}
            {!isGroup && (
              <span className={clsx(
                'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white',
                statusColor
              )} />
            )}
          </div>
          <h2 className="mt-3 text-lg font-bold text-gray-900">{displayName}</h2>
          {!isGroup && (
            <p className={clsx(
              'text-sm font-medium mt-0.5',
              peerUser?.status === 'online' ? 'text-green-500' : 'text-gray-400'
            )}>
              {peerUser?.status === 'online' ? 'Online' : 'Offline'}
            </p>
          )}
          {isGroup && (
            <p className="text-sm text-gray-400 mt-0.5">
              {conversation.participants?.length || 0} participants
            </p>
          )}
        </div>

        {/* Contact details (DM only) */}
        {!isGroup && peerUser && (
          <div className="px-4 py-4 border-b border-gray-100 space-y-3">
            <h4 className="infopanel-section-title">Contact</h4>
            {peerUser.email && (
              <div className="infopanel-contact-row">
                <div className="infopanel-icon-circle bg-blue-50">
                  <Mail size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700">{peerUser.email}</p>
                </div>
              </div>
            )}
            {peerUser.phone && (
              <div className="infopanel-contact-row">
                <div className="infopanel-icon-circle bg-green-50">
                  <Phone size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-gray-700">{peerUser.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Group participants */}
        {isGroup && (
          <div className="px-4 py-4">
            <h4 className="infopanel-section-title flex items-center">
              <Users size={12} className="mr-1" />
              Participants
            </h4>
            <div className="space-y-2">
              {/* Current user first */}
              <div className="infopanel-participant">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {currentUser?.first_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser?.first_name} {currentUser?.last_name}{' '}
                    <span className="text-xs text-gray-400">(you)</span>
                  </p>
                </div>
              </div>
              {conversation.participants
                ?.filter(p => (p.user_id?._id || p.user?._id || p.user_id)?.toString() !== currentUser?._id?.toString())
                .map((p, i) => {
                  const u = p.user || p;
                  return (
                    <div key={i} className="infopanel-participant">
                      <div className="w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {(u.first_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.first_name} {u.last_name}
                        </p>
                        {u.status && (
                          <p className={clsx(
                            'text-xs',
                            u.status === 'online' ? 'text-green-500' : 'text-gray-400'
                          )}>
                            {u.status}
                          </p>
                        )}
                      </div>
                      {p.is_admin && (
                        <Shield size={14} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Conversation created */}
        {conversation.createdAt && (
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock size={12} />
              <span>Created {format(new Date(conversation.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
