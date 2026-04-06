import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, LogOut } from 'lucide-react';
import Message from './Message';

// Configure the backend URL based on environment. For local dev:
const BACKEND_URL = 'http://localhost:3001';

const Chat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial fetch of messages
    axios.get(`${BACKEND_URL}/messages?userId=${user.id}`)
      .then(response => {
        setMessages(response.data);
      })
      .catch(error => console.error("Error fetching messages:", error));

    // Connect socket
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Socket Event listeners
    newSocket.on('messageAdded', (message) => {
      setMessages(prev => {
        // Prevent duplicate if we already have it locally
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    newSocket.on('messagePinned', ({ id, isPinned }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isPinned } : m));
    });

    newSocket.on('messageDeletedEveryone', ({ id }) => {
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, isDeletedForEveryone: 1, text: 'This message was deleted' } : m
      ));
    });

    return () => newSocket.close();
  }, [user.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    const newMsgObj = {
      text: inputValue.trim(),
      senderId: user.id,
      senderName: user.name
    };

    // Optimistically add to UI, let server replace it? 
    // Usually simpler to just wait for broadcast or emit and response
    socket.emit('sendMessage', newMsgObj);
    setInputValue('');
  };

  const handlePin = (id, isPinned) => {
    if (!socket) return;
    socket.emit('pinMessage', { id, isPinned });
  };

  const handleDelete = (id, type) => {
    if (!socket) return;
    socket.emit('deleteMessage', { id, userId: user.id, type });
    
    if (type === 'me') {
      // Optimistically remove from my view
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>
          <div className="user-info">
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            {user.name}
          </div>
        </h2>
        <button className="action-btn" onClick={onLogout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>

      <div className="messages-area">
        {messages.map(msg => (
          <Message 
            key={msg.id} 
            message={msg} 
            currentUserId={user.id}
            onPin={handlePin}
            onDelete={handleDelete}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
