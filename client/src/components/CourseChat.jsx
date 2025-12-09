import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

const socket = io.connect(SOCKET_URL);

const CourseChat = ({ courseId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/messages`);
        setMessages(res.data);
        scrollToBottom();
      } catch (err) { console.error("Failed to load chat history"); }
    };
    fetchHistory();
    socket.emit('join_room', courseId);
    
    const handleReceive = (data) => {
      setMessages((list) => [...list, data]);
      scrollToBottom();
    };
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [courseId]);

  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage !== '') {
      await socket.emit('send_message', {
        courseId, senderId: user.id, senderName: user.name, content: currentMessage
      });
      setCurrentMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="bg-brand-50 p-4 border-b border-brand-100 flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-brand-700" />
        <h3 className="font-serif font-bold text-brand-900">Class Discussion</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {messages.map((msg, i) => {
          const isMe = msg.sender._id === user.id || msg.sender === user.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                isMe ? 'bg-brand-700 text-white rounded-tr-none' : 'bg-white border border-stone-200 rounded-tl-none'
              }`}>
                {!isMe && <p className="text-xs font-bold text-stone-500 mb-1">{msg.sender.name}</p>}
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
        <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-brand-500 outline-none" />
        <button type="submit" className="p-2 bg-brand-700 text-white rounded-full hover:bg-brand-800"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  );
};
export default CourseChat;
