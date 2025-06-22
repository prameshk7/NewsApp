import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Blog({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ blg_title: '', blg_desc: '', images: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

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
    if (!form.blg_title || !form.blg_desc) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('blg_title', form.blg_title);
    formData.append('blg_desc', form.blg_desc);
    form.images.forEach((file, index) => formData.append(`images[${index}]image`, file));

    try {
      let response;
      const url = editing
        ? `http://localhost:8000/api/v1/blogs/${selectedBlogId}/`
        : 'http://localhost:8000/api/v1/blogs/';
      const method = editing ? axios.put : axios.post;

      response = await method(url, formData, {
        headers: { 
          Authorization: `Token ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (editing) {
        setBlogs(blogs.map(item => item.blg_id === selectedBlogId ? response.data : item));
      } else {
        setBlogs([...blogs, response.data]);
      }
      setForm({ blg_title: '', blg_desc: '', images: [] });
      setEditing(false);
      setSelectedBlogId(null);
      setError('');
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} blog.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setForm({ blg_title: blog.blg_title, blg_desc: blog.blg_desc, images: [] }); // Re-upload images for simplicity
    setEditing(true);
    setSelectedBlogId(blog.blg_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8000/api/v1/blogs/${id}/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        setBlogs(blogs.filter(item => item.blg_id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete blog.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>Blog Management</h2>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Blog Title</label>
          <input
            type="text"
            value={form.blg_title}
            onChange={(e) => setForm({ ...form, blg_title: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
          <textarea
            value={form.blg_desc}
            onChange={(e) => setForm({ ...form, blg_desc: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px', resize: 'vertical', minHeight: '100px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setForm({ ...form, images: Array.from(e.target.files) })}
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
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Blog' : 'Add Blog')}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Blog List</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : blogs.length === 0 ? (
          <p style={{ color: '#374151' }}>No blogs available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {blogs.map(blog => (
              <li key={blog.blg_id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {blog.blg_title} {blog.images && blog.images.length > 0 && blog.images[0].image && <img src={`/media/${blog.images[0].image}`} alt={blog.blg_title} style={{ width: '50px', marginLeft: '10px' }} />}
                </div>
                <div>
                  <button onClick={() => handleEdit(blog)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(blog.blg_id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Blog;