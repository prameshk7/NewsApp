import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function User({ user, setUser }) {
  const [profile, setProfile] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    profile_image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    profile_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('profile/')
      .then(response => {
        const data = response.data;
        const newProfile = {
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email || '',
          username: data.username || '',
          password: '',
          confirm_password: '',
          profile_image: data.profile_image || null,
        };
        setProfile(newProfile);
        setOriginalProfile({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email || '',
          username: data.username || '',
          profile_image: data.profile_image || null,
        });
        if (data.profile_image) {
          setImagePreview(`http://localhost:8000${data.profile_image}`);
        }
      })
      .catch(err => {
        console.error('Profile fetch error:', err.response?.data || err.message);
        setError('Failed to fetch profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
        setError('Unsupported file type. Use JPG, JPEG, or PNG.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size exceeds 2MB limit.');
        return;
      }
      setProfile({ ...profile, profile_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing && profile.password && profile.password !== profile.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('firstname', profile.firstname);
    formData.append('lastname', profile.lastname);
    formData.append('email', profile.email);
    formData.append('username', profile.username);
    if (profile.password) {
      formData.append('password', profile.password);
      formData.append('confirm_password', profile.confirm_password);
    }
    if (profile.profile_image instanceof File) {
      formData.append('profile_image', profile.profile_image);
    }

    try {
      const response = await api.put('profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Update response:', response.data);
      if (typeof setUser === 'function') {
        setUser({ ...user, ...response.data });
      } else {
        console.warn('setUser is not a function; updating localStorage only.');
        localStorage.setItem('username', response.data.username);
      }
      localStorage.setItem('username', response.data.username);
      setOriginalProfile({
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        email: response.data.email,
        username: response.data.username,
        profile_image: response.data.profile_image,
      });
      setProfile({
        ...profile,
        password: '',
        confirm_password: '',
        profile_image: response.data.profile_image,
      });
      setImagePreview(response.data.profile_image ? `http://localhost:8000${response.data.profile_image}` : null);
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
      if (profile.password) {
        setSuccess('Profile and password updated successfully. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Update error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      let errorMessage = 'Failed to update profile.';
      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.username) {
          errorMessage = err.response.data.username[0];
        } else if (err.response.data.email) {
          errorMessage = err.response.data.email[0];
        } else if (err.response.data.confirm_password) {
          errorMessage = err.response.data.confirm_password[0];
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message === 'setUser is not a function') {
        errorMessage = 'Profile updated, but app state could not be refreshed. Please refresh the page.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setProfile({
      ...originalProfile,
      password: '',
      confirm_password: '',
    });
    setImagePreview(originalProfile.profile_image ? `http://localhost:8000${originalProfile.profile_image}` : null);
    setIsEditing(false);
    setError('');
    setSuccess('');
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
      {success && (
        <div style={{
          backgroundColor: '#D1FAE5',
          color: '#065F46',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '16px',
        }}>
          {success}
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#374151' }}>Loading...</div>
      ) : (
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
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
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
          {isEditing && (
            <>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>New Password</label>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  placeholder="Leave blank to keep unchanged"
                  disabled={loading}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Confirm Password</label>
                <input
                  type="password"
                  value={profile.confirm_password}
                  onChange={(e) => setProfile({ ...profile, confirm_password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  placeholder="Leave blank to keep unchanged"
                  disabled={loading}
                />
              </div>
            </>
          )}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
              disabled={loading || !isEditing}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Profile Preview"
                style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '8px' }}
              />
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
      )}
    </div>
  );
}

export default User;