import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function UserAdminManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', firstname: '', lastname: '', email: '', password: '', profile_image: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchUsername, setSearchUsername] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.is_staff || user?.is_superuser) {
      setError('You do not have permission to manage users.');
      return;
    }
    setLoading(true);
    api.get('users/')
      .then(response => setUsers(response.data))
      .catch(err => setError('Failed to fetch users.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleFileChange = (e) => {
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
      setForm({ ...form, profile_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_staff || user?.is_superuser) {
      setError('You do not have permission to perform this action.');
      return;
    }
    if (!form.username || !form.firstname || !form.lastname || !form.email || (!editing && !form.password)) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('firstname', form.firstname);
    formData.append('lastname', form.lastname);
    formData.append('email', form.email);
    if (form.password) formData.append('password', form.password);
    if (form.profile_image) formData.append('profile_image', form.profile_image);

    try {
      const response = await api({
        method: editing ? 'put' : 'post',
        url: editing ? `profile/${form.id}/` : 'register/',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = response.data;
      if (editing) {
        setUsers(users.map(u => u.id === form.id ? updatedUser : u));
      } else {
        setUsers([...users, updatedUser]);
      }
      setForm({ username: '', firstname: '', lastname: '', email: '', password: '', profile_image: null });
      setImagePreview(null);
      setEditing(false);
      setError('');
      setIsFormVisible(false);
      setCurrentPage(1);
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'create'} user. ${err.response?.data?.error || ''}`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u) => {
    if (u.is_staff || u.created_by !== user.id) {
      setError('You cannot edit this user.');
      return;
    }
    setForm({
      id: u.id,
      username: u.username,
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      password: '',
      profile_image: null,
    });
    setImagePreview(u.profile_image ? `http://localhost:8000${u.profile_image}` : null);
    setEditing(true);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!user?.is_staff || user?.is_superuser) {
      setError('You do not have permission to perform this action.');
      return;
    }
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete.is_staff || userToDelete.created_by !== user.id) {
      setError('You cannot delete this user.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await api.delete(`profile/${id}/`);
        setUsers(users.filter(u => u.id !== id));
        setSelectedIds(selectedIds => {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          return newSet;
        });
        if (users.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('No items selected for bulk delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} item(s)?`)) {
      setLoading(true);
      try {
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`profile/${id}/`)));
        setUsers(users.filter(u => !selectedIds.has(u.id)));
        setSelectedIds(new Set());
        if (users.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        setError('');
      } catch (err) {
        setError('Failed to delete selected users.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(u => !searchUsername || u.username.toLowerCase().includes(searchUsername.toLowerCase()));
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (!user?.is_staff || user?.is_superuser) {
    return <div style={{ padding: '24px', color: '#DC2626' }}>Access Denied: Only managers can manage users.</div>;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>User List</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            style={{ padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', flexGrow: 1 }}
          />
          <button
            onClick={handleBulkDelete}
            style={{ padding: '8px 16px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Bulk Delete
          </button>
        </div>
      </div>
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        style={{ padding: '10px 20px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px' }}
      >
        {isFormVisible ? 'Cancel' : 'Create User'}
      </button>
      {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      {isFormVisible && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Username</label><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading || editing} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>First Name</label><input type="text" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Last Name</label><input type="text" value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} placeholder={editing ? 'Leave blank to keep unchanged' : ''} required={!editing} disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Profile Image</label><input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} disabled={loading} />{imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }} />}</div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }} disabled={loading} onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')} onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}>{loading ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update User' : 'Create User')}</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        {loading ? <p style={{ color: '#374151' }}>Loading...</p> : paginatedUsers.length === 0 ? <p style={{ color: '#374151' }}>No users available.</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(paginatedUsers.map(u => u.id)) : new Set())} /></th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>ID</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Username</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Name</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Email</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Profile Image</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Option</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(u => (
                  <tr key={u.id} style={{ backgroundColor: u.id % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}><input type="checkbox" checked={selectedIds.has(u.id)} onChange={(e) => setSelectedIds(prev => { const newSet = new Set(prev); e.target.checked ? newSet.add(u.id) : newSet.delete(u.id); return newSet; })} /></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{u.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{u.username}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{`${u.firstname} ${u.lastname}`}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{u.email}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{u.profile_image && <img src={`http://localhost:8000${u.profile_image}`} alt={`${u.username}'s profile`} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>
                      <button onClick={() => handleEdit(u)} style={{ color: '#2563EB', border: 'none', background: 'none', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(u.id)} style={{ color: '#DC2626', border: 'none', background: 'none' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '8px' }}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '8px 12px', backgroundColor: currentPage === 1 ? '#E5E7EB' : '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => handlePageChange(page)} style={{ padding: '8px 12px', backgroundColor: currentPage === page ? '#059669' : '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{page}</button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '8px 12px', backgroundColor: currentPage === totalPages ? '#E5E7EB' : '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserAdminManagement;