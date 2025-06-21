import React, { useState, useEffect } from 'react';
import axios from 'axios';

function User({ user }) {
  const [profile, setProfile] = useState({ firstname: '', lastname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/v1/user/profile/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setProfile(response.data))
      .catch(err => setError('Failed to fetch profile.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:8000/api/v1/user/profile/', profile, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setError('');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#F9FAFB',
      minHeight: 'calc(100vh - 64px)',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1F2A44',
        marginBottom: '24px',
      }}>User Profile</h2>
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '480px',
      }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
          <input
            type="text"
            value={user.email || ''}
            readOnly
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Username</label>
          <input
            type="text"
            value={user.username || ''}
            readOnly
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>First Name</label>
          <input
            type="text"
            value={profile.firstname}
            onChange={(e) => setProfile({ ...profile, firstname: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Last Name</label>
          <input
            type="text"
            value={profile.lastname}
            onChange={(e) => setProfile({ ...profile, lastname: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#1F2A44',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease',
          }}
          disabled={loading}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2C3B2A')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#1F2A44')}
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}

export default User;