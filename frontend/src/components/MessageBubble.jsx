import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Reply, Trash2, Edit2, Copy, Star, MoreHorizontal, Check, CheckCheck } from 'lucide-react';
import './MessageBubble.css';

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
  : 'http://localhost:5000';

const MessageBubble = ({
  message,
  isMe,
  isGroup,
  showSenderName,
  onReply,
  onDelete,
  onEdit,
  onReact,
  readBy = [],
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef(null);

  const rawTime = message._time || message.createdAt || message.created_at;
  const time = rawTime ? format(new Date(rawTime), 'HH:mm') : '';

  const isDeleted = message.is_deleted;
  const reactions = message.reactions || [];

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  // Resolve attachment file URL
  const attachments = message.attachmentDocs || [];

  // Close menu on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  if (isDeleted) {
    return (
      <div className={clsx('msgbubble-row', isMe ? 'is-me' : 'is-peer')}>
        <div className="msgbubble-deleted">
          <p className="text-xs text-gray-400 italic">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('msgbubble-row group', isMe ? 'is-me' : 'is-peer')}
      ref={menuRef}
    >
      {/* Action bar (appears on hover, on the outside of the bubble) */}
      {!isDeleted && (
        <div className={clsx(
          'msgbubble-actions',
          isMe ? 'is-me' : 'is-peer'
        )}>
          <button
            onClick={() => onReply?.(message)}
            className="msgbubble-tool"
            title="Reply"
          >
            <Reply size={14} />
          </button>
          <button
            onClick={() => setShowReactions(v => !v)}
            className="msgbubble-tool"
            title="React"
          >
            <span className="text-sm leading-none">😊</span>

            {/* Quick reaction picker */}
            {showReactions && (
              <div className={clsx(
                'msgbubble-react-picker',
                isMe ? 'is-me' : 'is-peer'
              )}>
                {QUICK_REACTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => { onReact?.(message._id, e); setShowReactions(false); }}
                    className="text-base hover:scale-125 transition-transform px-0.5"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </button>
          <button
            onClick={() => setShowMenu(v => !v)}
            className="msgbubble-tool"
            title="More"
          >
            <MoreHorizontal size={14} />

            {/* Context menu */}
            {showMenu && (
              <div className={clsx(
                'msgbubble-menu',
                isMe ? 'is-me' : 'is-peer'
              )}>
                <button
                  onClick={() => { onReply?.(message); setShowMenu(false); }}
                  className="msgbubble-menu-item"
                >
                  <Reply size={14} /> Reply
                </button>
                <button
                  onClick={handleCopy}
                  className="msgbubble-menu-item"
                >
                  <Copy size={14} /> Copy
                </button>
                {isMe && !isDeleted && (
                  <button
                    onClick={() => { onEdit?.(message); setShowMenu(false); }}
                    className="msgbubble-menu-item"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button
                  onClick={() => { onDelete?.(message, false); setShowMenu(false); }}
                  className="msgbubble-menu-item is-danger"
                >
                  <Trash2 size={14} /> Delete for me
                </button>
                {isMe && (
                  <button
                    onClick={() => { onDelete?.(message, true); setShowMenu(false); }}
                    className="msgbubble-menu-item is-danger font-medium"
                  >
                    <Trash2 size={14} /> Delete for all
                  </button>
                )}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Bubble */}
      <div className="msgbubble-col">
        {/* Sender name in group chats */}
        {isGroup && showSenderName && !isMe && (
          <p className="text-xs font-semibold text-primary ml-1 mb-0.5">
            {message.senderInfo?.first_name || 'Unknown'}
          </p>
        )}

        <div
          className={clsx(
            'msgbubble-bubble',
            isMe ? 'is-me' : 'is-peer'
          )}
        >
          {/* Reply preview */}
          {message.replyToMsg && (
            <div className={clsx(
              'msgbubble-reply',
              isMe ? 'is-me' : 'is-peer'
            )}>
              <p className={clsx('font-semibold', isMe ? 'text-blue-100' : 'text-primary')}>
                {message.replyToMsg.senderInfo?.first_name || 'Message'}
              </p>
              <p className={clsx('truncate', isMe ? 'text-blue-100' : 'text-gray-600')}>
                {message.replyToMsg.content}
              </p>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mb-2 space-y-1">
              {attachments.map((att, i) => {
                const isImage = att.file_type?.startsWith('image/');
                const url = att.file_url?.startsWith('http')
                  ? att.file_url
                  : `${BACKEND_URL}${att.file_url}`;
                return isImage ? (
                  <img
                    key={i}
                    src={url}
                    alt={att.file_name}
                    className="msgbubble-attach-img"
                    onClick={() => window.open(url, '_blank')}
                  />
                ) : (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      'msgbubble-attach-file',
                      isMe ? 'is-me' : 'is-peer'
                    )}
                  >
                    <span className="text-lg">📎</span>
                    <span className="truncate">{att.file_name}</span>
                    <span className="opacity-60 flex-shrink-0">{att.file_size}</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

          {/* Time + status */}
          <div className={clsx(
            'flex items-center justify-end gap-1 mt-0.5',
            isMe ? 'text-blue-100' : 'text-gray-400'
          )}>
            <span className="text-[10px]">{time}</span>
            {message.is_edited && (
              <span className="text-[10px] italic opacity-70">edited</span>
            )}
            {isMe && (
              <span className="text-[10px]">
                {readBy.length > 0 ? (
                  <CheckCheck size={12} className="inline text-blue-200" />
                ) : (
                  <Check size={12} className="inline opacity-70" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={clsx('flex flex-wrap gap-0.5 mt-1', isMe ? 'justify-end' : 'justify-start')}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(message._id, emoji)}
                className="msgbubble-reaction"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-gray-600">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
