import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { connectSocket, disconnectSocket } from '../services/socket';

const ChatLayout = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Establish socket connection on mount
  useEffect(() => {
    const socket = connectSocket();

    // Authenticate socket
    const user = JSON.parse(localStorage.getItem('user'));
    if (socket && user) {
      socket.emit('authenticate', { user_id: user._id, device_info: 'web' });
    }

    return () => {
      // Don't necessarily disconnect on unmount if we want to keep it alive,
      // but typically good practice to clean up or handle reconnects.
      // For now, let's keep it simple.
      // disconnectSocket();
    };
  }, []);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="w-1/3 min-w-[320px] border-r border-gray-200">
        <Sidebar
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
      </div>
      <div className="flex-1 bg-gray-50">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
