import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Reply, Trash2, Edit2, Copy, Star, MoreHorizontal, Check, CheckCheck } from 'lucide-react';

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
      <div className={clsx('flex mb-1', isMe ? 'justify-end' : 'justify-start')}>
        <div className="px-4 py-2 rounded-2xl bg-gray-100 border border-dashed border-gray-300">
          <p className="text-xs text-gray-400 italic">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('flex mb-1 group items-end gap-1', isMe ? 'justify-end' : 'justify-start')}
      ref={menuRef}
    >
      {/* Action bar (appears on hover, on the outside of the bubble) */}
      {!isDeleted && (
        <div className={clsx(
          'flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-0.5',
          isMe ? 'order-first' : 'order-last'
        )}>
          <button
            onClick={() => onReply?.(message)}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
            title="Reply"
          >
            <Reply size={14} />
          </button>
          <button
            onClick={() => setShowReactions(v => !v)}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 relative"
            title="React"
          >
            <span className="text-sm leading-none">😊</span>

            {/* Quick reaction picker */}
            {showReactions && (
              <div className={clsx(
                'absolute bottom-full mb-1 z-20 bg-white border border-gray-200 rounded-full shadow-lg flex p-1 gap-0.5',
                isMe ? 'right-0' : 'left-0'
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
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 relative"
            title="More"
          >
            <MoreHorizontal size={14} />

            {/* Context menu */}
            {showMenu && (
              <div className={clsx(
                'absolute bottom-full mb-1 z-20 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-36',
                isMe ? 'right-0' : 'left-0'
              )}>
                <button
                  onClick={() => { onReply?.(message); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Reply size={14} /> Reply
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy size={14} /> Copy
                </button>
                {isMe && !isDeleted && (
                  <button
                    onClick={() => { onEdit?.(message); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button
                  onClick={() => { onDelete?.(message, false); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete for me
                </button>
                {isMe && (
                  <button
                    onClick={() => { onDelete?.(message, true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
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
      <div className="max-w-[70%] flex flex-col">
        {/* Sender name in group chats */}
        {isGroup && showSenderName && !isMe && (
          <p className="text-xs font-semibold text-primary ml-1 mb-0.5">
            {message.senderInfo?.first_name || 'Unknown'}
          </p>
        )}

        <div
          className={clsx(
            'px-4 py-2 rounded-2xl relative shadow-sm',
            isMe
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
          )}
        >
          {/* Reply preview */}
          {message.replyToMsg && (
            <div className={clsx(
              'border-l-2 pl-2 mb-2 rounded text-xs opacity-80',
              isMe ? 'border-blue-200 bg-white/10' : 'border-primary bg-gray-50'
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
                    className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer"
                    onClick={() => window.open(url, '_blank')}
                  />
                ) : (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      'flex items-center gap-2 p-2 rounded-lg text-xs',
                      isMe ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
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
                className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-xs shadow-sm hover:bg-gray-50 transition-colors"
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
