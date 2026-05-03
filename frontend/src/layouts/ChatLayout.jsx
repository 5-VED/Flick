import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InfoPanel from '../components/InfoPanel';
import { connectSocket } from '../services/socket';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const ChatLayout = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'chat'
  const { pendingChatUser, setPendingChatUser } = useApp();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) return;

    const socket = connectSocket();
    if (socket) {
      socket.emit('authenticate', { user_id: user._id, device_info: 'web' });
    }
  }, []);

  // Auto-open a conversation when pendingChatUser is set (e.g. from LiveTracking "Message" button)
  useEffect(() => {
    if (!pendingChatUser?._id) return;

    api.get('/conversation/direct', { params: { target_user_id: pendingChatUser._id } })
      .then(res => {
        if (res.data.success) {
          setSelectedConversation(res.data.data);
          setView('chat');
        }
      })
      .catch(console.error)
      .finally(() => setPendingChatUser(null));
  }, [pendingChatUser]);

  const handleSelectConversation = conv => {
    setSelectedConversation(conv);
    setShowInfo(false);
    setView('chat');
  };

  const handleConversationCreated = updatedConv => {
    setSelectedConversation(updatedConv);
  };

  const handleBack = () => {
    setView('list');
    setShowInfo(false);
  };

  // 64px bottom padding to clear the BottomNav overlay
  const BOTTOM_NAV_H = 64;

  return (
    <div className="flex flex-col bg-white overflow-hidden" style={{ height: '100%' }}>
      {view === 'list' ? (
        <div className="flex flex-col overflow-hidden" style={{ height: '100%', paddingBottom: BOTTOM_NAV_H }}>
          <Sidebar
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      ) : (
        <div className="flex flex-col relative" style={{ height: '100%', paddingBottom: BOTTOM_NAV_H }}>
          {selectedConversation ? (
            <>
              <ChatWindow
                conversation={selectedConversation}
                onConversationCreated={handleConversationCreated}
                onInfoOpen={() => setShowInfo(v => !v)}
                onBack={handleBack}
              />
              {showInfo && (
                <div className="absolute inset-0 z-20 bg-white">
                  <InfoPanel
                    conversation={selectedConversation}
                    onClose={() => setShowInfo(false)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <div className="text-6xl mb-3">💬</div>
              <p className="text-base font-semibold text-gray-500">Flick Messenger</p>
              <p className="text-sm text-gray-400 mt-1">Select a chat to start messaging</p>
              <button
                onClick={handleBack}
                className="mt-4 text-sm text-primary underline"
              >
                Back to chats
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatLayout;
