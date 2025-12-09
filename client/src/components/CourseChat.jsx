import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Connect to backend (remove /api from the URL to get the root server URL)
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

const socket = io.connect(SOCKET_URL);

const CourseChat = ({ courseId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // 1. Fetch History via API
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/messages`);
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load chat history");
      }
    };
    fetchHistory();

    // 2. Join Room via Socket
    socket.emit('join_room', courseId);

    // 3. Listen for new messages
    const handleReceiveMessage = (data) => {
      setMessages((list) => [...list, data]);
      scrollToBottom();
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [courseId]);

  // Scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage !== '') {
      const messageData = {
        courseId: courseId,
        senderId: user.id,
        senderName: user.name,
        content: currentMessage,
      };

      // Emit to socket server
      await socket.emit('send_message', messageData);
      setCurrentMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-brand-50 p-4 border-b border-brand-100 flex items-center space-x-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <MessageSquare className="w-5 h-5 text-brand-700" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-brand-900 text-lg">Discussion Room</h3>
          <p className="text-xs text-stone-500 uppercase tracking-wide">Live Chat</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50">
        {messages.map((msg, index) => {
          const isMe = msg.sender._id === user.id || msg.sender === user.id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Sender Name */}
                {!isMe && (
                  <span className="text-xs font-bold text-stone-500 mb-1 ml-1 font-serif">
                    {msg.sender.name}
                  </span>
                )}

                {/* Bubble */}
                <div className={`px-5 py-3 shadow-sm relative ${
                  isMe 
                    ? 'bg-brand-700 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white text-stone-800 border border-stone-200 rounded-2xl rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>

                {/* Time */}
                <span className="text-[10px] text-stone-400 mt-1 mx-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-stone-200 flex gap-3">
        <input
          type="text"
          value={currentMessage}
          onChange={(event) => setCurrentMessage(event.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-5 py-3 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 bg-stone-50 placeholder-stone-400 transition-all"
        />
        <button 
          type="submit"
          disabled={!currentMessage.trim()}
          className="p-3 bg-brand-700 text-white rounded-full hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default CourseChat;
