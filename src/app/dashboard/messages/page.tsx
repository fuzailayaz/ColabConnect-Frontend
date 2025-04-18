"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Send, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

// 🟢 Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { user: currentUser } = useAuth();

  // 🟢 Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🟢 Fetch users from Supabase
  const fetchUsers = useCallback(async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, avatar, online");

      if (userError) throw userError;

      if (!userData) {
        throw new Error('No user data received');
      }

      // Sync users with MongoDB
      await Promise.all(userData.map(async (user) => {
        try {
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
          });
          if (!response.ok) {
            throw new Error(`Failed to sync user ${user.id}`);
          }
        } catch (syncError) {
          console.warn(`Failed to sync user ${user.id} with MongoDB:`, syncError);
        }
      }));

      setUsers(userData.filter((user) => user.id !== currentUser?.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      console.error("Error fetching users:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [currentUser?.id]);

  // 🟢 Fetch messages from Supabase
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);

      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender.eq.${currentUser?.id},receiver.eq.${selectedUser}`)
        .order('timestamp', { ascending: true });

      if (messageError) throw messageError;

      if (!messageData) {
        throw new Error('No message data received');
      }

      setMessages(messageData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [selectedUser, currentUser?.id]);

  // 🟢 Setup WebSocket Connection
  const connectWebSocket = useCallback(() => {
    if (!selectedUser) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    const ws = new WebSocket(
      `wss://your-websocket-server.com/chat?room=${selectedUser}&token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      toast.success("Connected to chat");
    };

    ws.onmessage = (event) => {
      try {
        const data: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      toast.error("Connection lost. Attempting to reconnect...");
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [selectedUser]);

  // 🟢 Listen for Realtime Messages via Supabase
  useEffect(() => {
    if (!selectedUser) return;

    const messageSubscription = supabase
      .channel(`chat:${selectedUser}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [selectedUser]);

  // 🟢 Fetch Users & Messages
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const cleanup = connectWebSocket();
      return () => {
        cleanup?.();
      };
    }
  }, [selectedUser, fetchMessages, connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🟢 Send Message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    const messageData: Omit<Message, "id"> = {
      sender: currentUser?.id || "",
      receiver: selectedUser,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data as Message]);
      setNewMessage("");
      scrollToBottom();

      wsRef.current?.send(JSON.stringify(data));
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Conversations</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedUser === user.id ? "bg-blue-50 dark:bg-blue-900" : ""
              }`}
            >
              <div className="relative">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.online ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
