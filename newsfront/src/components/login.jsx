import React, { useState } from 'react';
import api from '../utils/axiosConfig';

function Login({ setUser, navigate }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (token) => {
    try {
      const response = await api.get('profile/');
      console.log('Profile response:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err.response?.data || err.message);
      setError('Failed to load user profile. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('login/', credentials);
      const { token, message } = response.data;
      if (!token || message !== 'Login successful') {
        throw new Error('Invalid login response: token or message missing/incorrect');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('username', credentials.username);
      await fetchProfile(token);
      navigate('/dashboard/news');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#F3F4F6',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '24px',
          textAlign: 'center',
        }}>News Login</h2>
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
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
              marginBottom: '8px',
              display: 'block',
            }}>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{
                width: '93%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1F2937',
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
              marginBottom: '8px',
              display: 'block',
            }}>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '93%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1F2937',
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
              padding: '14px',
              backgroundColor: '#1F2A44',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;