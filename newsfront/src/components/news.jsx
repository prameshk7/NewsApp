import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News({ user, categories, types }) {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', desc: '', category: '', type: '', image_files: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/v1/news/', { headers: { Authorization: `Token ${user.token}` } })
      .then(response => setNews(response.data))
      .catch(err => setError('Failed to fetch news.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.desc || !form.category || !form.type) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('desc', form.desc);
    formData.append('category', form.category);
    formData.append('type', form.type);
    if (form.image_files instanceof File) formData.append('image_files', form.image_files);

    try {
      let response;
      if (editing) {
        response = await axios.put(`http://localhost:8000/api/v1/news/${form.id}/`, formData, {
          headers: { 
            Authorization: `Token ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setNews(news.map(item => item.id === form.id ? response.data : item));
      } else {
        response = await axios.post('http://localhost:8000/api/v1/news/', formData, {
          headers: { 
            Authorization: `Token ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setNews([...news, response.data]);
      }
      setForm({ id: null, title: '', desc: '', category: '', type: '', image_files: '' });
      setEditing(false);
      setError('');
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} news.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      desc: item.desc,
      category: item.category?.id?.toString() || '',
      type: item.type?.id?.toString() || '',
      image_files: item.image_files || '', // Use the full path from the server
    });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8000/api/v1/news/${id}/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        setNews(news.filter(item => item.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete news.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>News Management</h2>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px', resize: 'vertical', minHeight: '100px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          >
            <option value="">Select Type</option>
            {types.map(t => (
              <option key={t.id} value={t.id.toString()}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image_files: e.target.files[0] })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            disabled={loading}
          />
          {typeof form.image_files === 'string' && form.image_files && (
            <div style={{ marginTop: '8px' }}>
              <img src={`/news_images/${form.image_files}`} alt="Current" style={{ width: '100px' }} />
              <p>Current image. Upload new to replace.</p>
            </div>
          )}
        </div>
        <button
          type="submit"
          style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }}
          disabled={loading}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}
        >
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update News' : 'Add News')}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>News List</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : news.length === 0 ? (
          <p style={{ color: '#374151' }}>No news available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {news.map(item => (
              <li key={item.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {item.title} {item.image_files && <img src={`/news_images/${item.image_files}`} alt={item.title} style={{ width: '50px', marginLeft: '10px' }} />}
                </div>
                <div>
                  <button onClick={() => handleEdit(item)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default News;