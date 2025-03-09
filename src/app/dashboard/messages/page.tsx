'use client';

import { useState, useEffect } from 'react';
import { wsService } from '@/utils/websocket';
import api from '@/utils/api';

interface Message {
  id: number;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  const fetchMessages = async () => {
    try {
      const response = await api.get<Message[]>('/api/messages/');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    try {
      await api.post('/api/messages/', {
        receiver: selectedUser,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (selectedUser) {
      const roomName = `chat_${selectedUser}`;
      const ws = wsService.connect(roomName, token || '');

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      };

      return () => {
        wsService.disconnect();
      };
    }
  }, [selectedUser]);

  return (
    <div className="flex h-screen">
      {/* Users sidebar */}
      <div className="w-1/4 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user}
              className={`p-2 cursor-pointer rounded ${
                selectedUser === user ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </div>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-3 rounded-lg ${
                message.sender === 'currentUser'
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200'
              } max-w-[70%]`}
            >
              <p className="text-sm font-semibold">{message.sender}</p>
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
