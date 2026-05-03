import React, { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { getSocket } from '../services/socket';
import api from '../services/api';
import MessageBubble from './MessageBubble';
import EmojiPicker from './EmojiPicker';
import {
  Send, Paperclip, Smile, X, Search, Info,
  ChevronDown, Reply as ReplyIcon, ArrowLeft
} from 'lucide-react';

const normalizeMsg = msg => ({
  ...msg,
  _senderId: (msg.senderInfo?._id || msg.sender?._id || msg.sender)?.toString(),
  _time: msg.createdAt || msg.created_at,
});

const ChatWindow = ({ conversation, onConversationCreated, onInfoOpen, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [peerStatus, setPeerStatus] = useState(null);

  // Feature states
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState([]); // [{ _id, file_url, file_name, file_type, file_size }]
  const [uploadingFile, setUploadingFile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const LIMIT = 50;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  };

  // Scroll detection for "scroll to bottom" button
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);

    // Load more when scrolled to top
    if (el.scrollTop < 50 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversation?._id || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    socket.emit('history', {
      conversation_id: conversation._id,
      page: nextPage,
      limit: LIMIT,
      search: searchQuery,
    });
  }, [conversation?._id, page, searchQuery]);

  // ─── Main effect: setup socket listeners & load history ───────────
  useEffect(() => {
    if (!conversation) return;

    setLoading(true);
    setMessages([]);
    setTypingUser(null);
    setReplyTo(null);
    setEditMsg(null);
    setPage(1);
    setHasMore(false);
    isLoadingMoreRef.current = false;

    const socket = getSocket();
    if (!socket) { setLoading(false); return; }

    if (conversation._id) {
      socket.emit('join_room', { conversation_id: conversation._id });
      socket.emit('history', { conversation_id: conversation._id, page: 1, limit: LIMIT });
      // Mark conversation as read
      socket.emit('mark_read', { conversation_id: conversation._id });
    } else {
      setLoading(false);
    }

    // ── Handlers ──────────────────────────────────────────────────
    const handleMsgList = response => {
      if (response.success) {
        const msgData = response.data;
        const reversed = (msgData.messages || []).map(normalizeMsg).reverse();

        if (isLoadingMoreRef.current) {
          setMessages(prev => [...reversed, ...prev]);
        } else {
          setMessages(reversed);
          setHasMore(msgData.count > LIMIT);
          setTimeout(() => scrollToBottom(false), 50);
        }
      }
      setLoading(false);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    };

    const handleMsgReceive = ({ data: msg }) => {
      if (msg) setMessages(prev => [...prev, normalizeMsg(msg)]);
    };

    const handleNewMsgNotification = payload => {
      if (payload.conversation_id?.toString() === conversation._id?.toString()) {
        setMessages(prev => [...prev, normalizeMsg(payload.message)]);
      }
    };

    const handleTyping = ({ user_id }) => {
      if (user_id?.toString() !== user?._id?.toString()) {
        setTypingUser(user_id);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const handleStopTyping = () => {
      setTypingUser(null);
      clearTimeout(typingTimeoutRef.current);
    };

    const handleUserStatus = ({ user_id, status }) => {
      const isRelevant = conversation.participants?.some(
        p => (p.user_id?._id || p.user_id || p.user?._id)?.toString() === user_id?.toString()
          && user_id?.toString() !== user?._id?.toString()
      );
      if (isRelevant) setPeerStatus(status);
    };

    const handleMessageDeleted = ({ message_id, delete_for_everyone, content }) => {
      setMessages(prev => prev.map(m => {
        if (m._id?.toString() !== message_id?.toString()) return m;
        return delete_for_everyone
          ? { ...m, is_deleted: true, content: content || 'This message was deleted', reactions: [] }
          : null; // null = deleted for self (filter out below)
      }).filter(Boolean));
    };

    const handleMessageEdited = ({ message_id, content }) => {
      setMessages(prev => prev.map(m =>
        m._id?.toString() === message_id?.toString()
          ? { ...m, content, is_edited: true }
          : m
      ));
    };

    const handleReactionUpdated = ({ message_id, reactions }) => {
      setMessages(prev => prev.map(m =>
        m._id?.toString() === message_id?.toString()
          ? { ...m, reactions }
          : m
      ));
    };

    socket.on('msg_list', handleMsgList);
    socket.on('msg_recieve', handleMsgReceive);
    socket.on('new_message_notification', handleNewMsgNotification);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('user_status_changed', handleUserStatus);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_edited', handleMessageEdited);
    socket.on('reaction_updated', handleReactionUpdated);

    return () => {
      if (conversation._id) socket.emit('leave_room', { conversation_id: conversation._id });
      socket.off('msg_list', handleMsgList);
      socket.off('msg_recieve', handleMsgReceive);
      socket.off('new_message_notification', handleNewMsgNotification);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('user_status_changed', handleUserStatus);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_edited', handleMessageEdited);
      socket.off('reaction_updated', handleReactionUpdated);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [conversation?._id]);

  // Auto-scroll on new messages (only if near bottom)
  useEffect(() => {
    if (!showScrollBtn) scrollToBottom();
  }, [messages.length]);

  // ─── Typing emission ──────────────────────────────────────────────
  const emitTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversation?._id) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversation_id: conversation._id, user_id: user?._id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { conversation_id: conversation._id, user_id: user?._id });
    }, 2000);
  }, [conversation?._id]);

  // ─── File upload ──────────────────────────────────────────────────
  const handleFileSelect = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadingFile(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/user/add-attachments', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data.data?.[0];
      if (uploaded) setAttachments(prev => [...prev, uploaded]);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeAttachment = id => setAttachments(prev => prev.filter(a => a._id !== id));

  // ─── Send / Edit message ──────────────────────────────────────────
  const handleSendMessage = e => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed && attachments.length === 0) return;

    const socket = getSocket();
    if (!socket) return;

    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    if (conversation._id) {
      socket.emit('stop_typing', { conversation_id: conversation._id, user_id: user?._id });
    }

    if (editMsg) {
      // Edit mode
      socket.emit('edit_message', {
        message_id: editMsg._id,
        content: trimmed,
        conversation_id: conversation._id,
      });
      setMessages(prev => prev.map(m =>
        m._id === editMsg._id ? { ...m, content: trimmed, is_edited: true } : m
      ));
      setEditMsg(null);
      setInputValue('');
      return;
    }

    const payload = {
      content: trimmed || (attachments.length > 0 ? '📎 Attachment' : ''),
      conversation_id: conversation._id || null,
      participants: conversation.participants?.map(p => p.user_id?._id || p.user_id || p.user?._id || p) || [],
      name: conversation.name,
      reply_to: replyTo?._id || null,
      attachments: attachments.map(a => a._id),
    };

    socket.once('msg_sent', response => {
      if (response.success) {
        const newMsg = normalizeMsg({
          ...response.data,
          replyToMsg: replyTo ? {
            content: replyTo.content,
            senderInfo: replyTo.senderInfo,
          } : null,
          attachmentDocs: attachments,
        });
        setMessages(prev => [...prev, newMsg]);

        if (!conversation._id && response.data?.conversation_id) {
          onConversationCreated?.({
            ...conversation,
            _id: response.data.conversation_id.toString(),
          });
        }
      }
    });

    socket.emit('send-private-message', payload);
    setInputValue('');
    setReplyTo(null);
    setAttachments([]);
  };

  // ─── Message actions ──────────────────────────────────────────────
  const handleReply = msg => {
    setReplyTo(msg);
    setEditMsg(null);
    inputRef.current?.focus();
  };

  const handleEdit = msg => {
    setEditMsg(msg);
    setReplyTo(null);
    setInputValue(msg.content);
    inputRef.current?.focus();
  };

  const handleDelete = (msg, forEveryone) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('delete_message', {
      message_id: msg._id,
      conversation_id: conversation._id,
      delete_for_everyone: forEveryone,
    });
    if (!forEveryone) {
      setMessages(prev => prev.filter(m => m._id !== msg._id));
    }
  };

  const handleReact = (msgId, emoji) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('react_message', {
      message_id: msgId,
      emoji,
      conversation_id: conversation._id,
    });
  };

  // ─── Message search ───────────────────────────────────────────────
  const handleSearch = e => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket || !conversation._id) return;
    setLoading(true);
    socket.emit('history', {
      conversation_id: conversation._id,
      page: 1,
      limit: LIMIT,
      search: searchQuery,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    if (conversation._id) {
      setLoading(true);
      const socket = getSocket();
      socket?.emit('history', { conversation_id: conversation._id, page: 1, limit: LIMIT });
    }
  };

  // ─── Header display ───────────────────────────────────────────────
  const otherParticipants = conversation.participants?.filter(
    p => (p.user_id?._id || p.user_id || p.user?._id)?.toString() !== user?._id?.toString()
  ) || [];
  const firstOther = otherParticipants[0];
  const firstOtherUser = firstOther?.user || firstOther;
  const displayName = conversation.is_group_chat
    ? (conversation.name || 'Group Chat')
    : (firstOtherUser
        ? `${firstOtherUser.first_name || ''} ${firstOtherUser.last_name || ''}`.trim()
        : conversation.name || 'Chat');

  const resolvedStatus = peerStatus || firstOtherUser?.status || 'offline';
  const isOnline = resolvedStatus === 'online';
  const subtext = conversation.is_group_chat
    ? `${conversation.participants?.length || 0} members`
    : (isOnline ? 'Online' : 'Offline');

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4 shadow-sm z-10 gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!conversation.is_group_chat && (
            <span className={clsx(
              'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            )} />
          )}
        </div>

        <div className="flex-1 min-w-0" onClick={() => onInfoOpen?.()}>
          <h2 className="font-semibold text-gray-800 text-sm truncate cursor-pointer hover:text-primary">
            {displayName}
          </h2>
          {typingUser ? (
            <p className="text-xs text-primary animate-pulse">typing...</p>
          ) : (
            <p className={clsx('text-xs', isOnline && !conversation.is_group_chat ? 'text-green-500' : 'text-gray-400')}>
              {subtext}
            </p>
          )}
        </div>

        {/* Header actions */}
        <button
          onClick={() => setShowSearch(v => !v)}
          className={clsx(
            'p-2 rounded-full transition-colors',
            showSearch ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-500'
          )}
          title="Search messages"
        >
          <Search size={18} />
        </button>
        <button
          onClick={() => onInfoOpen?.()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          title="Info"
        >
          <Info size={18} />
        </button>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────── */}
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100"
        >
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search in conversation..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
          <button type="submit" className="text-primary text-xs font-medium">Search</button>
        </form>
      )}

      {/* ── Messages area ───────────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 bg-[#f0f0f0]/40 relative"
      >
        {loadingMore && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-400">Loading older messages...</span>
          </div>
        )}
        {hasMore && !loadingMore && (
          <div className="text-center py-1">
            <button
              onClick={loadMoreMessages}
              className="text-xs text-primary hover:underline"
            >
              Load older messages
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm">
                {searchQuery ? 'No messages match your search' : 'No messages yet. Say hello!'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const sameDay = prevMsg && new Date(msg._time).toDateString() === new Date(prevMsg._time).toDateString();
            const showSenderName = msg._senderId !== messages[idx - 1]?._senderId;

            return (
              <React.Fragment key={msg._id || idx}>
                {/* Date separator */}
                {!sameDay && msg._time && (
                  <div className="flex items-center justify-center my-3">
                    <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
                      {new Date(msg._time).toDateString() === new Date().toDateString()
                        ? 'Today'
                        : new Date(msg._time).toDateString() === new Date(Date.now() - 86400000).toDateString()
                        ? 'Yesterday'
                        : new Date(msg._time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isMe={msg._senderId === user?._id?.toString()}
                  isGroup={conversation.is_group_chat}
                  showSenderName={showSenderName}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onReact={handleReact}
                />
              </React.Fragment>
            );
          })
        )}

        {/* Typing dots */}
        {typingUser && (
          <div className="flex justify-start mt-1">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
              <div className="flex space-x-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <ChevronDown size={18} className="text-gray-600" />
        </button>
      )}

      {/* ── Input area ───────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 relative">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-4 pt-3 flex-wrap">
            {attachments.map(att => {
              const isImage = att.file_type?.startsWith('image/');
              const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
              const url = att.file_url?.startsWith('http') ? att.file_url : `${BACKEND_URL}${att.file_url}`;
              return (
                <div key={att._id} className="relative group">
                  {isImage ? (
                    <img src={url} alt={att.file_name} className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                  ) : (
                    <div className="h-16 w-24 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-xs text-gray-500 p-1">
                      <span className="text-xl">📄</span>
                      <span className="truncate w-full text-center">{att.file_name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(att._id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
            {uploadingFile && (
              <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Reply / Edit preview */}
        {(replyTo || editMsg) && (
          <div className={clsx(
            'flex items-center gap-2 px-4 pt-2 pb-1 border-t border-gray-100',
            editMsg ? 'bg-yellow-50' : 'bg-blue-50'
          )}>
            <div className="flex-1 min-w-0">
              <p className={clsx('text-xs font-semibold', editMsg ? 'text-yellow-700' : 'text-primary')}>
                {editMsg ? '✏️ Editing message' : `↩ Replying to ${replyTo?.senderInfo?.first_name || 'message'}`}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {editMsg ? editMsg.content : replyTo?.content}
              </p>
            </div>
            <button
              onClick={() => { setReplyTo(null); setEditMsg(null); setInputValue(''); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <div className="absolute bottom-full left-4 mb-1 z-20">
            <EmojiPicker
              onSelect={e => setInputValue(prev => prev + e)}
              onClose={() => setShowEmoji(false)}
            />
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2 p-3">
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            className={clsx(
              'p-2 rounded-full transition-colors flex-shrink-0 mb-0.5',
              showEmoji ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Smile size={22} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 mb-0.5"
            disabled={uploadingFile}
          >
            <Paperclip size={22} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.mp4,.mp3"
            className="hidden"
            onChange={handleFileSelect}
          />

          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none text-sm resize-none max-h-32 overflow-y-auto"
            placeholder="Type a message..."
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); emitTyping(); }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
            }}
          />

          <button
            type="submit"
            className={clsx(
              'p-2 rounded-full transition-colors flex-shrink-0 mb-0.5',
              (inputValue.trim() || attachments.length > 0)
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-200 text-gray-400 cursor-default'
            )}
            disabled={!inputValue.trim() && attachments.length === 0}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
