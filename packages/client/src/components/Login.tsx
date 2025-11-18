import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (username: string, token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('username', username);
        onLogin(username, data.token);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Florb Universe</h1>
        <p className="login-subtitle">
          {isRegistering ? 'Create your account to start collecting Florbs' : 'Welcome back, Florb Collector'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="auth-toggle">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="toggle-button"
          >
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;