import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function UserAdminManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', firstname: '', lastname: '', email: '', password: '', profile_image: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    console.log('User in UserAdminManagement:', user);
    if (!user || !user.is_staff || user.is_superuser) {
      setError('You do not have permission to manage users.');
      return;
    }
    setLoading(true);
    api.get('users/')
      .then(response => setUsers(response.data))
      .catch(err => setError('Failed to fetch users.'))
      .finally(() => setLoading(false));
  }, [user?.token, user?.is_staff, user?.is_superuser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_staff || user?.is_superuser) {
      setError('You do not have permission to perform this action.');
      return;
    }
    if (!form.username || !form.firstname || !form.lastname || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('firstname', form.firstname);
    formData.append('lastname', form.lastname);
    formData.append('email', form.email);
    formData.append('password', form.password);
    if (form.profile_image) formData.append('profile_image', form.profile_image);

    try {
      const response = await api({
        method: editing ? 'put' : 'post',
        url: editing ? `profile/${selectedUserId}/` : 'register/',
        data: formData,
      });
      const updatedUser = response.data;
      if (editing) {
        setUsers(users.map(u => u.id === selectedUserId ? updatedUser : u));
      } else {
        setUsers([...users, updatedUser]);
      }
      setForm({ username: '', firstname: '', lastname: '', email: '', password: '', profile_image: null });
      setEditing(false);
      setSelectedUserId(null);
      setError('');
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'create'} user. ${err.response?.data?.error || ''}`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    if (user.is_staff || user.created_by !== user.id) {
      setError('You cannot edit this user.');
      return;
    }
    setForm({ username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, password: '', profile_image: null });
    setEditing(true);
    setSelectedUserId(user.id);
  };

  const handleDelete = async (id) => {
    if (!user.is_staff || user.is_superuser || window.confirm('Are you sure you want to delete this user?')) {
      const userToDelete = users.find(u => u.id === id);
      if (userToDelete && (userToDelete.is_staff || userToDelete.created_by !== user.id)) {
        setError('You cannot delete this user.');
        return;
      }
      setLoading(true);
      try {
        await api.delete(`profile/${id}/`);
        setUsers(users.filter(u => u.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user?.is_staff || user?.is_superuser) {
    return <div style={{ padding: '24px', color: '#DC2626' }}>Access Denied: Only managers can manage users.</div>;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>User Management</h2>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading || editing}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>First Name</label>
          <input
            type="text"
            value={form.firstname}
            onChange={(e) => setForm({ ...form, firstname: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Last Name</label>
          <input
            type="text"
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required={!editing}
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, profile_image: e.target.files[0] })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }}
          disabled={loading}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}
        >
          {loading ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update User' : 'Create User')}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Staff Users</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ color: '#374151' }}>No staff users available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map(u => (
              <li key={u.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                {u.username} ({u.firstname} {u.lastname})
                <div>
                  <button onClick={() => handleEdit(u)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(u.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserAdminManagement;