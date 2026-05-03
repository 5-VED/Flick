import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../AppContext'
import { getSocket } from '../services/socket'
import api from '../services/api'

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🙏']
const LIMIT = 50

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function getConvDisplayName(conv, currentUserId) {
  if (conv.is_group_chat) return conv.name || 'Group Chat'
  const other = conv.participants?.find(
    p => (p.user_id?._id || p.user?._id || p.user_id)?.toString() !== currentUserId?.toString()
  )
  const u = other?.user || other
  if (u?.first_name) return `${u.first_name} ${u.last_name || ''}`.trim()
  return conv.name || 'Chat'
}

function normalizeMsg(msg) {
  return {
    ...msg,
    _senderId: (msg.senderInfo?._id || msg.sender?._id || msg.sender)?.toString(),
    _time: msg.createdAt || msg.created_at,
  }
}

// ─── Conversation list panel ─────────────────────────────────────────────────
function ConversationList({ selected, onSelect }) {
  const { rider } = useApp()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/conversation/get-all')
      setConversations(res.data.data?.conversations || [])
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const socket = getSocket()
    if (!socket) return
    const onNew = () => fetchConversations()
    socket.on('new_message_notification', onNew)
    return () => socket.off('new_message_notification', onNew)
  }, [fetchConversations])

  const filtered = conversations.filter(c =>
    getConvDisplayName(c, rider?._id).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-surface border-r border-white/5">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-white/5">
        <h2 className="font-display text-xl text-white mb-3">Messages</h2>
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-muted outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-muted text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm">
            {search ? 'No results' : 'No conversations yet'}
          </div>
        ) : filtered.map(conv => {
          const name = getConvDisplayName(conv, rider?._id)
          const lastMsg = conv.last_message?.content || ''
          const time = conv.last_message?.sent_at ? formatTime(conv.last_message.sent_at) : ''
          const unread = conv.total_unread_messages || 0
          const isSelected = selected?._id === conv._id

          return (
            <button
              key={conv._id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                isSelected ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg flex-shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-sm font-semibold text-white truncate">{name}</span>
                  <span className="text-[10px] text-muted flex-shrink-0 ml-2">{time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted truncate">{lastMsg}</p>
                  {unread > 0 && (
                    <span className="ml-2 flex-shrink-0 bg-primary text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, isMe, isGroup, showSender, onReply, onEdit, onDelete, onReact }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const ref = useRef(null)
  const time = formatTime(msg._time)

  const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowMenu(false)
        setShowReactions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (msg.is_deleted) {
    return (
      <div className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className="px-4 py-2 rounded-2xl border border-dashed border-white/20">
          <p className="text-xs text-muted italic">This message was deleted</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className={`flex mb-1 group items-end gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Action bar */}
      <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-0.5 ${isMe ? 'order-first' : 'order-last'}`}>
        <button
          onClick={() => onReply?.(msg)}
          className="p-1 rounded-full hover:bg-white/10 text-muted"
          title="Reply"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 00-4-4H4" />
          </svg>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowReactions(v => !v)}
            className="p-1 rounded-full hover:bg-white/10 text-muted text-sm"
          >
            😊
          </button>
          {showReactions && (
            <div className={`absolute bottom-full mb-1 z-20 bg-[#1E1E1E] border border-white/10 rounded-full shadow-xl flex p-1 gap-0.5 ${isMe ? 'right-0' : 'left-0'}`}>
              {QUICK_REACTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => { onReact?.(msg._id, e); setShowReactions(false) }}
                  className="text-base hover:scale-125 transition-transform px-0.5"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="p-1 rounded-full hover:bg-white/10 text-muted"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <div className={`absolute bottom-full mb-1 z-20 bg-[#1E1E1E] border border-white/10 rounded-xl shadow-xl overflow-hidden w-36 ${isMe ? 'right-0' : 'left-0'}`}>
              <button onClick={() => { onReply?.(msg); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 text-left">
                Reply
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(msg.content); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 text-left"
              >
                Copy
              </button>
              {isMe && (
                <button onClick={() => { onEdit?.(msg); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 text-left">
                  Edit
                </button>
              )}
              <button onClick={() => { onDelete?.(msg, false); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 text-left">
                Delete for me
              </button>
              {isMe && (
                <button onClick={() => { onDelete?.(msg, true); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 font-medium text-left">
                  Delete for all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bubble */}
      <div className="max-w-[70%] flex flex-col">
        {isGroup && showSender && !isMe && (
          <p className="text-[10px] font-semibold text-primary ml-1 mb-0.5">
            {msg.senderInfo?.first_name || 'Unknown'}
          </p>
        )}
        <div className={`px-4 py-2 rounded-2xl shadow-sm ${
          isMe
            ? 'bg-primary text-black rounded-br-none'
            : 'bg-[#1E1E1E] text-white rounded-bl-none border border-white/5'
        }`}>
          {/* Reply preview */}
          {msg.replyToMsg && (
            <div className={`border-l-2 pl-2 mb-2 rounded text-xs opacity-80 ${
              isMe ? 'border-black/30 bg-black/10' : 'border-primary/50 bg-white/5'
            }`}>
              <p className={`font-semibold text-[10px] ${isMe ? 'text-black/70' : 'text-primary'}`}>
                {msg.replyToMsg.senderInfo?.first_name || 'Message'}
              </p>
              <p className={`truncate ${isMe ? 'text-black/80' : 'text-muted'}`}>
                {msg.replyToMsg.content}
              </p>
            </div>
          )}

          {/* Attachments */}
          {(msg.attachmentDocs || []).map((att, i) => {
            const isImage = att.file_type?.startsWith('image/')
            const url = att.file_url?.startsWith('http') ? att.file_url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${att.file_url}`
            return isImage ? (
              <img key={i} src={url} alt={att.file_name} className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer mb-2" onClick={() => window.open(url, '_blank')} />
            ) : (
              <a key={i} href={url} target="_blank" rel="noreferrer"
                className={`flex items-center gap-2 p-2 rounded-lg text-xs mb-2 ${isMe ? 'bg-black/20' : 'bg-white/5'}`}
              >
                <span className="text-lg">📎</span>
                <span className="truncate">{att.file_name}</span>
              </a>
            )
          })}

          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

          <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMe ? 'text-black/50' : 'text-muted'}`}>
            <span className="text-[10px]">{time}</span>
            {msg.is_edited && <span className="text-[10px] italic opacity-70">edited</span>}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex flex-wrap gap-0.5 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(msg._id, emoji)}
                className="flex items-center gap-0.5 bg-[#1E1E1E] border border-white/10 rounded-full px-1.5 py-0.5 text-xs hover:bg-white/10 transition-colors"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-muted">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chat panel ──────────────────────────────────────────────────────────────
function ChatPanel({ conversation }) {
  const { rider } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingUser, setTypingUser] = useState(null)
  const [peerStatus, setPeerStatus] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [editMsg, setEditMsg] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const isLoadingMoreRef = useRef(false)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [uploadingFile, setUploadingFile] = useState(false)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 200)
    if (el.scrollTop < 50 && hasMore && !loadingMore) loadMoreMessages()
  }

  const loadMoreMessages = useCallback(() => {
    const socket = getSocket()
    if (!socket || !conversation?._id || isLoadingMoreRef.current) return
    isLoadingMoreRef.current = true
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    socket.emit('history', { conversation_id: conversation._id, page: nextPage, limit: LIMIT, search: searchQuery })
  }, [conversation?._id, page, searchQuery])

  useEffect(() => {
    if (!conversation) return

    setLoading(true)
    setMessages([])
    setTypingUser(null)
    setReplyTo(null)
    setEditMsg(null)
    setPage(1)
    setHasMore(false)
    isLoadingMoreRef.current = false

    const socket = getSocket()
    if (!socket) { setLoading(false); return }

    if (conversation._id) {
      socket.emit('join_room', { conversation_id: conversation._id })
      socket.emit('history', { conversation_id: conversation._id, page: 1, limit: LIMIT })
      socket.emit('mark_read', { conversation_id: conversation._id })
    } else {
      setLoading(false)
    }

    const handleMsgList = res => {
      if (res.success) {
        const reversed = (res.data.messages || []).map(normalizeMsg).reverse()
        if (isLoadingMoreRef.current) {
          setMessages(prev => [...reversed, ...prev])
        } else {
          setMessages(reversed)
          setHasMore(res.data.count > LIMIT)
          setTimeout(() => scrollToBottom(false), 50)
        }
      }
      setLoading(false)
      setLoadingMore(false)
      isLoadingMoreRef.current = false
    }

    const handleMsgReceive = ({ data: msg }) => {
      if (msg) setMessages(prev => [...prev, normalizeMsg(msg)])
    }

    const handleNotification = payload => {
      if (payload.conversation_id?.toString() === conversation._id?.toString()) {
        setMessages(prev => [...prev, normalizeMsg(payload.message)])
      }
    }

    const handleTyping = ({ user_id }) => {
      if (user_id?.toString() !== rider?._id?.toString()) {
        setTypingUser(user_id)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000)
      }
    }

    const handleStopTyping = () => {
      setTypingUser(null)
      clearTimeout(typingTimeoutRef.current)
    }

    const handleUserStatus = ({ user_id, status }) => {
      const isRelevant = conversation.participants?.some(
        p => (p.user_id?._id || p.user_id || p.user?._id)?.toString() === user_id?.toString()
          && user_id?.toString() !== rider?._id?.toString()
      )
      if (isRelevant) setPeerStatus(status)
    }

    const handleDeleted = ({ message_id, delete_for_everyone, content }) => {
      setMessages(prev => prev.map(m => {
        if (m._id?.toString() !== message_id?.toString()) return m
        return delete_for_everyone
          ? { ...m, is_deleted: true, content: content || 'This message was deleted', reactions: [] }
          : null
      }).filter(Boolean))
    }

    const handleEdited = ({ message_id, content }) => {
      setMessages(prev => prev.map(m =>
        m._id?.toString() === message_id?.toString() ? { ...m, content, is_edited: true } : m
      ))
    }

    const handleReaction = ({ message_id, reactions }) => {
      setMessages(prev => prev.map(m =>
        m._id?.toString() === message_id?.toString() ? { ...m, reactions } : m
      ))
    }

    socket.on('msg_list', handleMsgList)
    socket.on('msg_recieve', handleMsgReceive)
    socket.on('new_message_notification', handleNotification)
    socket.on('typing', handleTyping)
    socket.on('stop_typing', handleStopTyping)
    socket.on('user_status_changed', handleUserStatus)
    socket.on('message_deleted', handleDeleted)
    socket.on('message_edited', handleEdited)
    socket.on('reaction_updated', handleReaction)

    return () => {
      if (conversation._id) socket.emit('leave_room', { conversation_id: conversation._id })
      socket.off('msg_list', handleMsgList)
      socket.off('msg_recieve', handleMsgReceive)
      socket.off('new_message_notification', handleNotification)
      socket.off('typing', handleTyping)
      socket.off('stop_typing', handleStopTyping)
      socket.off('user_status_changed', handleUserStatus)
      socket.off('message_deleted', handleDeleted)
      socket.off('message_edited', handleEdited)
      socket.off('reaction_updated', handleReaction)
      clearTimeout(typingTimeoutRef.current)
    }
  }, [conversation?._id])

  useEffect(() => {
    if (!showScrollBtn) scrollToBottom()
  }, [messages.length])

  const emitTyping = useCallback(() => {
    const socket = getSocket()
    if (!socket || !conversation?._id) return
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing', { conversation_id: conversation._id, user_id: rider?._id })
    }
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('stop_typing', { conversation_id: conversation._id, user_id: rider?._id })
    }, 2000)
  }, [conversation?._id, rider?._id])

  const handleFileSelect = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingFile(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/user/add-attachments', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const uploaded = res.data.data?.[0]
      if (uploaded) setAttachments(prev => [...prev, uploaded])
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSend = e => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed && attachments.length === 0) return

    const socket = getSocket()
    if (!socket) return

    isTypingRef.current = false
    clearTimeout(typingTimeoutRef.current)
    if (conversation._id) socket.emit('stop_typing', { conversation_id: conversation._id, user_id: rider?._id })

    if (editMsg) {
      socket.emit('edit_message', { message_id: editMsg._id, content: trimmed, conversation_id: conversation._id })
      setMessages(prev => prev.map(m => m._id === editMsg._id ? { ...m, content: trimmed, is_edited: true } : m))
      setEditMsg(null)
      setInput('')
      return
    }

    const payload = {
      content: trimmed || (attachments.length > 0 ? '📎 Attachment' : ''),
      conversation_id: conversation._id || null,
      participants: conversation.participants?.map(p => p.user_id?._id || p.user_id || p.user?._id || p) || [],
      name: conversation.name,
      reply_to: replyTo?._id || null,
      attachments: attachments.map(a => a._id),
    }

    socket.once('msg_sent', res => {
      if (res.success) {
        const newMsg = normalizeMsg({
          ...res.data,
          replyToMsg: replyTo ? { content: replyTo.content, senderInfo: replyTo.senderInfo } : null,
          attachmentDocs: attachments,
        })
        setMessages(prev => [...prev, newMsg])
      }
    })

    socket.emit('send-private-message', payload)
    setInput('')
    setReplyTo(null)
    setAttachments([])
  }

  const handleReply = msg => { setReplyTo(msg); setEditMsg(null); inputRef.current?.focus() }
  const handleEdit = msg => { setEditMsg(msg); setReplyTo(null); setInput(msg.content); inputRef.current?.focus() }

  const handleDelete = (msg, forEveryone) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('delete_message', { message_id: msg._id, conversation_id: conversation._id, delete_for_everyone: forEveryone })
    if (!forEveryone) setMessages(prev => prev.filter(m => m._id !== msg._id))
  }

  const handleReact = (msgId, emoji) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('react_message', { message_id: msgId, emoji, conversation_id: conversation._id })
  }

  const handleSearch = e => {
    e.preventDefault()
    const socket = getSocket()
    if (!socket || !conversation._id) return
    setLoading(true)
    socket.emit('history', { conversation_id: conversation._id, page: 1, limit: LIMIT, search: searchQuery })
  }

  const clearSearch = () => {
    setSearchQuery('')
    setShowSearch(false)
    if (conversation._id) {
      setLoading(true)
      const socket = getSocket()
      socket?.emit('history', { conversation_id: conversation._id, page: 1, limit: LIMIT })
    }
  }

  // Header display
  const otherParticipants = conversation.participants?.filter(
    p => (p.user_id?._id || p.user_id || p.user?._id)?.toString() !== rider?._id?.toString()
  ) || []
  const firstOther = otherParticipants[0]
  const firstOtherUser = firstOther?.user || firstOther
  const displayName = conversation.is_group_chat
    ? (conversation.name || 'Group Chat')
    : (firstOtherUser ? `${firstOtherUser.first_name || ''} ${firstOtherUser.last_name || ''}`.trim() : conversation.name || 'Chat')

  const resolvedStatus = peerStatus || firstOtherUser?.status || 'offline'
  const isOnline = resolvedStatus === 'online'
  const subtext = conversation.is_group_chat
    ? `${conversation.participants?.length || 0} members`
    : (isOnline ? 'Online' : 'Offline')

  const EMOJIS = ['😀','😂','😍','🤔','👍','👎','❤️','🙏','🔥','✅','😎','🥳']

  return (
    <div className="flex flex-col h-full bg-bg relative">
      {/* Header */}
      <div className="h-16 bg-surface border-b border-white/5 flex items-center px-5 gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{displayName}</h3>
          {typingUser ? (
            <p className="text-xs text-primary animate-pulse">typing...</p>
          ) : (
            <p className={`text-xs ${isOnline && !conversation.is_group_chat ? 'text-green-400' : 'text-muted'}`}>{subtext}</p>
          )}
        </div>
        <button
          onClick={() => setShowSearch(v => !v)}
          className={`p-2 rounded-xl transition-colors ${showSearch ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-muted'}`}
          title="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <form onSubmit={handleSearch} className="flex items-center gap-2 px-5 py-2 bg-surface border-b border-white/5">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-sm text-white placeholder-muted outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="text-muted hover:text-white text-xs">Clear</button>
          )}
          <button type="submit" className="text-primary text-xs font-semibold">Search</button>
        </form>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #111 100%)' }}
      >
        {loadingMore && <div className="text-center py-2 text-xs text-muted">Loading older messages...</div>}
        {hasMore && !loadingMore && (
          <div className="text-center py-1">
            <button onClick={loadMoreMessages} className="text-xs text-primary hover:underline">Load older messages</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm">{searchQuery ? 'No messages match your search' : 'No messages yet. Say hello!'}</p>
            </div>
          </div>
        ) : messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1]
          const sameDay = prevMsg && new Date(msg._time).toDateString() === new Date(prevMsg._time).toDateString()
          const showSender = msg._senderId !== messages[idx - 1]?._senderId

          return (
            <div key={msg._id || idx}>
              {!sameDay && msg._time && (
                <div className="flex items-center justify-center my-3">
                  <span className="bg-white/5 text-muted text-xs px-3 py-1 rounded-full">
                    {formatDate(msg._time)}
                  </span>
                </div>
              )}
              <MessageBubble
                msg={msg}
                isMe={msg._senderId === rider?._id?.toString()}
                isGroup={conversation.is_group_chat}
                showSender={showSender}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
              />
            </div>
          )
        })}

        {typingUser && (
          <div className="flex justify-start mt-1">
            <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex space-x-1 items-center h-4">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
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
          className="absolute bottom-24 right-6 w-9 h-9 bg-surface border border-white/10 rounded-full shadow-md flex items-center justify-center hover:bg-white/5 transition-colors z-10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Input area */}
      <div className="bg-surface border-t border-white/5 relative flex-shrink-0">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-4 pt-3 flex-wrap">
            {attachments.map(att => {
              const isImage = att.file_type?.startsWith('image/')
              const url = att.file_url?.startsWith('http') ? att.file_url : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${att.file_url}`
              return (
                <div key={att._id} className="relative group">
                  {isImage ? (
                    <img src={url} alt={att.file_name} className="h-16 w-16 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="h-16 w-24 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center text-xs text-muted p-1">
                      <span className="text-xl">📄</span>
                      <span className="truncate w-full text-center">{att.file_name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setAttachments(prev => prev.filter(a => a._id !== att._id))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                  >
                    ×
                  </button>
                </div>
              )
            })}
            {uploadingFile && (
              <div className="h-16 w-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Reply / Edit preview */}
        {(replyTo || editMsg) && (
          <div className={`flex items-center gap-2 px-4 pt-2 pb-1 border-t border-white/5 ${editMsg ? 'bg-yellow-500/5' : 'bg-primary/5'}`}>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${editMsg ? 'text-yellow-400' : 'text-primary'}`}>
                {editMsg ? '✏️ Editing message' : `↩ Replying to ${replyTo?.senderInfo?.first_name || 'message'}`}
              </p>
              <p className="text-xs text-muted truncate">{editMsg ? editMsg.content : replyTo?.content}</p>
            </div>
            <button
              onClick={() => { setReplyTo(null); setEditMsg(null); setInput('') }}
              className="p-1 text-muted hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <div className="absolute bottom-full left-4 mb-1 z-20 bg-[#1E1E1E] border border-white/10 rounded-2xl p-3 shadow-xl">
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { setInput(prev => prev + e); setShowEmoji(false) }}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2 p-3">
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 mb-0.5 ${showEmoji ? 'bg-primary/10 text-primary' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-xl transition-colors flex-shrink-0 mb-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.mp4,.mp3" className="hidden" onChange={handleFileSelect} />

          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => { setInput(e.target.value); emitTyping() }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-muted outline-none focus:border-primary/50 resize-none max-h-32 overflow-y-auto"
          />

          <button
            type="submit"
            disabled={!input.trim() && attachments.length === 0}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 mb-0.5 ${
              (input.trim() || attachments.length > 0) ? 'bg-primary text-black hover:bg-primary/90' : 'bg-white/5 text-muted cursor-default'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main Chat page ──────────────────────────────────────────────────────────
export default function Chat() {
  const { rider, pendingChatUser, setPendingChatUser } = useApp()
  const [selectedConv, setSelectedConv] = useState(null)

  useEffect(() => {
    if (!pendingChatUser?._id) return
    api.get('/conversation/direct', { params: { target_user_id: pendingChatUser._id } })
      .then(res => {
        if (res.data.success) setSelectedConv(res.data.data)
      })
      .catch(console.error)
      .finally(() => setPendingChatUser(null))
  }, [pendingChatUser])

  return (
    <div className="flex" style={{ height: '100vh' }}>
      {/* Conversation list */}
      <div className="w-80 flex-shrink-0">
        <ConversationList selected={selectedConv} onSelect={setSelectedConv} />
      </div>

      {/* Chat panel */}
      <div className="flex-1 relative overflow-hidden">
        {selectedConv ? (
          <ChatPanel conversation={selectedConv} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #111 100%)' }}>
            <div className="text-6xl mb-4">💬</div>
            <p className="font-display text-2xl text-white mb-2">Flick Messenger</p>
            <p className="text-muted text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
