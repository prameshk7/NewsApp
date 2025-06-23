import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { Editor } from '@tinymce/tinymce-react';

function Blog({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ blg_title: '', blg_desc: '', media: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get('blogs/')
      .then(response => {
        console.log('Blog data on fetch:', response.data);
        setBlogs(response.data);
      })
      .catch(err => setError('Failed to fetch blogs.'))
      .finally(() => setLoading(false));
  }, []);

  const validateFiles = (files) => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'ogg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (let file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setError(`Unsupported file type: ${ext}`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!validateFiles(files)) {
      e.target.value = ''; // Clear input
      return;
    }
    setForm({ ...form, media: files });
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

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
    form.media.forEach(file => formData.append('media_files', file));

    try {
      let response;
      const url = editing ? `blogs/${selectedBlogId}/` : 'blogs/';
      const method = editing ? api.put : api.post;

      response = await method(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (editing) {
        setBlogs(blogs.map(item => item.blg_id === selectedBlogId ? response.data : item));
      } else {
        setBlogs([...blogs, response.data]);
      }
      setForm({ blg_title: '', blg_desc: '', media: [] });
      setPreviews([]);
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
    setForm({ blg_title: blog.blg_title, blg_desc: blog.blg_desc, media: [] });
    setPreviews([]);
    setEditing(true);
    setSelectedBlogId(blog.blg_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setLoading(true);
      try {
        await api.delete(`blogs/${id}/`);
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

  const renderMedia = (mediaItem) => {
    const filePath = mediaItem.image;
    console.log('File path:', filePath); // Debugging log
    if (!filePath) {
      console.warn('Invalid file path:', mediaItem);
      return null;
    }
    const isFullUrl = filePath.startsWith('http://') || filePath.startsWith('https://');
    const src = isFullUrl ? filePath : `http://localhost:8000${filePath}`;
    console.log('Media source:', src); // Debugging log
    const extension = filePath.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <img
          src={src}
          alt="Blog media"
          style={{ width: '50px', height: '50px', objectFit: 'cover', marginLeft: '10px' }}
          loading="lazy"
          onError={(e) => console.error('Image load error:', src)}
        />
      );
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return (
        <video
          controls
          style={{ width: '100px', height: '50px', objectFit: 'cover', marginLeft: '10px' }}
          loading="lazy"
        >
          <source src={src} type={`video/${extension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  const renderPreview = (previewUrl, index) => {
    const extension = previewUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <img
          src={previewUrl}
          alt={`Preview ${index}`}
          style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
        />
      );
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return (
        <video
          controls
          style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
        >
          <source src={previewUrl} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>
        Blog Management
      </h2>
      {error && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <label
            style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
          >
            Blog Title
          </label>
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
          <label
            style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
          >
            Description
          </label>
          <Editor
            apiKey="178cv5oebxeklcxtalz2v56clmn153mlk5pb5zbz90723sykv0jf" // Ensure valid TinyMCE API key
            value={form.blg_desc}
            onEditorChange={(content) => setForm({ ...form, blg_desc: content })}
            init={{
              height: '200px',
              menubar: false,
              plugins: ['lists', 'link', 'image', 'code'],
              toolbar:
                'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image code',
            }}
            disabled={loading}
          />
        </div>
        <div>
          <label
            style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
          >
            Media Files (Images, GIFs, Videos)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,video/*,image/gif"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            disabled={loading}
          />
          {previews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
              {previews.map((preview, index) => (
                <div key={index}>{renderPreview(preview, index)}</div>
              ))}
            </div>
          )}
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
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Blog' : 'Add Blog')}
        </button>
      </form>
      <div
        style={{
          marginTop: '24px',
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>
          Blog List
        </h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : blogs.length === 0 ? (
          <p style={{ color: '#374151' }}>No blogs available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {blogs.map(blog => (
              <li
                key={blog.blg_id}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>{blog.blg_title}</span>
                  {blog.images &&
                    blog.images.map((mediaItem, index) => (
                      <span key={index}>{renderMedia(mediaItem)}</span>
                    ))}
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(blog)}
                    style={{
                      color: '#2563EB',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      marginRight: '10px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.blg_id)}
                    style={{
                      color: '#DC2626',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
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
