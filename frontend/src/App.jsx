import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');

  // Simple pseudo-auth for Demo purposes
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput.trim().length > 0) {
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: usernameInput.trim()
      };
      setUser(newUser);
      localStorage.setItem('chatUser', JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Welcome to AdveChat</h1>
          <p>Join the real-time conversation</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your name..."
              className="auth-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="primary-btn" disabled={!usernameInput.trim()}>
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Chat user={user} onLogout={handleLogout} />;
}

export default App;
