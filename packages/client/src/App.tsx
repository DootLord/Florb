import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const storedUsername = localStorage.getItem('username');

    if (token && storedUsername) {
      // Verify token is still valid
      verifyToken(token, storedUsername);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string, username: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsername(username);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('userToken');
        localStorage.removeItem('username');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('username');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: string, _token: string) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUsername('');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="app-loading">
        {/* Data streams */}
        <div className="data-stream">01010101 01100001 01110101 01100001</div>
        <div className="data-stream">11001100 00110011 11110000 00001111</div>
        <div className="data-stream">10101010 01010101 11111111 00000000</div>
        <div className="data-stream">FLORB_DATA_STREAM_INITIATED</div>

        <div className="loading-spinner"></div>
        <p>Loading Florb Universe...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Cyberpunk Background Effects */}
      <div className="cyber-grid"></div>
      <div className="particles-container">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      <div className="code-rain">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="code-stream"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 5 + 5}s`
            }}
          >
            {Array.from({ length: 20 }, (_, j) => (
              <div key={j} style={{ marginBottom: '10px' }}>
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {isAuthenticated ? (
        <Dashboard username={username} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
