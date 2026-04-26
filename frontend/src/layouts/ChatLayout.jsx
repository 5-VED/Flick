import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InfoPanel from '../components/InfoPanel';
import { connectSocket } from '../services/socket';

const ChatLayout = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) return;

    const socket = connectSocket();
    if (socket) {
      socket.emit('authenticate', { user_id: user._id, device_info: 'web' });
    }
  }, []);

  const handleConversationCreated = updatedConv => {
    setSelectedConversation(updatedConv);
  };

  const handleSelectConversation = conv => {
    setSelectedConversation(conv);
    setShowInfo(false);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[360px] min-w-[280px] border-r border-gray-200 flex-shrink-0">
        <Sidebar
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onConversationCreated={handleConversationCreated}
            onInfoOpen={() => setShowInfo(v => !v)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none bg-gray-50">
            <div className="text-7xl mb-4">💬</div>
            <p className="text-xl font-semibold text-gray-500">Flick Messenger</p>
            <p className="text-sm text-gray-400 mt-2">Select a chat to start messaging</p>
            <p className="text-xs text-gray-300 mt-1">or click + to start a new conversation</p>
          </div>
        )}
      </div>

      {/* Info panel */}
      {showInfo && selectedConversation && (
        <InfoPanel
          conversation={selectedConversation}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
};

export default ChatLayout;
