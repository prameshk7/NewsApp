import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Blog({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ blg_title: '', desc: '', blg_image: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/v1/blogs/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setBlogs(response.data))
      .catch(err => setError('Failed to fetch blogs.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.blg_title || !form.desc) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/blogs/', form, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setBlogs([...blogs, response.data]);
      setForm({ blg_title: '', desc: '', blg_image: [] });
      setError('');
    } catch (err) {
      setError('Failed to add blog.');
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
      }}>Blog Management</h2>
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
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Blog Title</label>
          <input
            type="text"
            value={form.blg_title}
            onChange={(e) => setForm({ ...form, blg_title: e.target.value })}
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
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Image URLs</label>
          <input
            type="text"
            value={form.blg_image.join(',')}
            onChange={(e) => setForm({ ...form, blg_image: e.target.value.split(',') })}
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
          {loading ? 'Adding...' : 'Add Blog'}
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
        }}>Blog List</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : blogs.length === 0 ? (
          <p style={{ color: '#374151' }}>No blogs available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {blogs.map(blog => (
              <li key={blog.blg_id} style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#F9FAFB',
                borderRadius: '4px',
              }}>
                {blog.blg_title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Blog;