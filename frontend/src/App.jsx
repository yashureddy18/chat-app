import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  
  // Initialize dark mode from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const savedMsg = localStorage.getItem('chatTheme');
    if (savedMsg) return savedMsg === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply .dark class to root element when isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chatTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chatTheme', 'light');
    }
  }, [isDark]);

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

  const toggleTheme = () => setIsDark(prev => !prev);

  const ThemeToggleButton = () => (
    <button 
      onClick={toggleTheme} 
      className="action-btn" 
      style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--panel-bg)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '50%', zIndex: 1000 }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  if (!user) {
    return (
      <div className="auth-container">
        <ThemeToggleButton />
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

  return (
    <>
      <ThemeToggleButton />
      <Chat user={user} onLogout={handleLogout} />
    </>
  );
}

export default App;
