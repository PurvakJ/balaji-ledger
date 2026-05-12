// components/Login.js
import React, { useState } from 'react';
import { login, changePassword } from '../services/api';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const result = await login(username, password);
      if (result.success) {
        onLogin(result.data);
      } else {
        setError(result.error);
      }
    } else {
      const result = await changePassword(username, password, newPassword);
      if (result.success) {
        alert('Password changed successfully! Please login again.');
        setIsLogin(true);
        setPassword('');
        setNewPassword('');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Login' : 'Change Password'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          )}
          {error && <div className="error-message">{error}</div>}
          <button type="submit">{isLogin ? 'Login' : 'Change Password'}</button>
        </form>
        <button 
          className="toggle-button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {isLogin ? 'Change Password' : 'Back to Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;