import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function User({ user }) {
  const [profile, setProfile] = useState({ firstname: '', lastname: '', email: '', profile_image: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({ firstname: '', lastname: '', email: '', profile_image: null }); // To store original values for cancel

  useEffect(() => {
    setLoading(true);
    api.get('profile/')
      .then(response => {
        const data = response.data;
        setProfile({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email || '',
          profile_image: data.profile_image || null,
        });
        setOriginalProfile({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email || '',
          profile_image: data.profile_image || null,
        });
      })
      .catch(err => setError('Failed to fetch profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('firstname', profile.firstname);
    formData.append('lastname', profile.lastname);
    formData.append('email', profile.email);
    if (profile.profile_image instanceof File) {
      formData.append('profile_image', profile.profile_image);
    }

    try {
      await api.put('profile/', formData);
      setError('');
      setOriginalProfile({ ...profile });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setIsEditing(false);
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
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            required
            disabled={loading || !isEditing}
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
            required
            disabled={loading || !isEditing}
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
            required
            disabled={loading || !isEditing}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfile({ ...profile, profile_image: e.target.files[0] })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            disabled={loading || !isEditing}
          />
          {profile.profile_image && typeof profile.profile_image === 'string' && (
            <img src={`http://localhost:8000${profile.profile_image}`} alt="Profile" style={{ width: '100px', marginTop: '8px' }} />
          )}
        </div>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '10px' }}>
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
                flex: 1,
                transition: 'background-color 0.3s ease',
              }}
              disabled={loading}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2C3B2A')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#1F2A44')}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '10px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                flex: 1,
                transition: 'background-color 0.3s ease',
              }}
              disabled={loading}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#B91C1C')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#DC2626')}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            style={{
              padding: '10px',
              backgroundColor: '#1F2A44',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#2C3B2A')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#1F2A44')}
          >
            Edit Profile
          </button>
        )}
      </form>
    </div>
  );
}

export default User;