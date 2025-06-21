import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News({ user }) {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', desc: '', category: '', type: '', images: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/v1/news/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setNews(response.data))
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
    try {
      const response = await axios.post('http://localhost:8000/api/v1/news/', form, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setNews([...news, response.data]);
      setForm({ title: '', desc: '', category: '', type: '', images: [] });
      setError('');
    } catch (err) {
      setError('Failed to add news.');
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
      }}>News Management</h2>
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
      }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical',
              minHeight: '100px',
            }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Type</label>
          <input
            type="text"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Image URLs</label>
          <input
            type="text"
            value={form.images.join(',')}
            onChange={(e) => setForm({ ...form, images: e.target.value.split(',') })}
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
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease',
          }}
          disabled={loading}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}
        >
          {loading ? 'Adding...' : 'Add News'}
        </button>
      </form>
      <div style={{
        marginTop: '24px',
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2A44',
          marginBottom: '16px',
        }}>News List</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : news.length === 0 ? (
          <p style={{ color: '#374151' }}>No news available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {news.map(item => (
              <li key={item.id} style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#F9FAFB',
                borderRadius: '4px',
              }}>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default News;