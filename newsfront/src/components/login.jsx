import React, { useState } from 'react';
import axios from 'axios';

function Login({ setUser, navigate }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      console.log('Sending login request with:', credentials); // Debug log
      const response = await axios.post('http://localhost:8000/api/v1/login/', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Received response:', response.data); // Debug log
      const { token, message } = response.data;
      if (!token || message !== 'Login successful') {
        throw new Error('Invalid login response: token or message missing/incorrect');
      }
      console.log('Login successful, setting user and token'); // Debug log
      localStorage.setItem('token', token);
      localStorage.setItem('username', credentials.username);
      setUser({ username: credentials.username, token });
      console.log('Navigating to /dashboard/news'); // Debug log
      navigate('/dashboard/news'); // Use navigate instead of window.location.href
    } catch (err) {
      console.error('Login error details:', err.response?.data || err.message); // Detailed error log
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '40px auto',
      padding: '24px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      position: 'relative',
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#1F2A44', 
        marginBottom: '24px', 
        textAlign: 'center' 
      }}>PubNews Admin Login</h2>
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '8px 16px',
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '4px', 
            display: 'block' 
          }}>Username</label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
              color: '#1F2A44',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#4B5563')}
            onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '4px', 
            display: 'block' 
          }}>Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
              color: '#1F2A44',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#4B5563')}
            onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#1F2A44',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
          }}
          disabled={loading}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2C3B2A', e.target.style.transform = 'scale(1.02)')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#1F2A44', e.target.style.transform = 'scale(1)')}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;