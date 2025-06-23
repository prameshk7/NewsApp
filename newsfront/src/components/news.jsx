import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import api from '../utils/axiosConfig';

function News({ user, categories, types }) {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', desc: '', category: '', type: '', media: [], video_url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get('news/')
      .then(response => {
        console.log('News data on fetch:', response.data);
        setNews(response.data);
      })
      .catch(err => setError('Failed to fetch news.'))
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

  const validateUrl = (url) => {
    if (!url) return true; // Allow empty URL
    try {
      new URL(url);
      return true;
    } catch {
      setError('Invalid video URL');
      return false;
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!validateFiles(files)) {
      e.target.value = '';
      return;
    }
    setForm({ ...form, media: files });
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.desc || !form.category || !form.type) {
      setError('Title, description, category, and type are required.');
      return;
    }
    if (!validateUrl(form.video_url)) {
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('desc', form.desc);
    formData.append('category', form.category);
    formData.append('type', form.type);
    formData.append('video_url', form.video_url);
    form.media.forEach(file => formData.append('media_files', file));

    try {
      let response;
      if (editing) {
        response = await api.put(`news/${form.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('news/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setNews(editing ? news.map(item => item.id === form.id ? response.data : item) : [...news, response.data]);
      setForm({ id: null, title: '', desc: '', category: '', type: '', media: [], video_url: '' });
      setPreviews([]);
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
      media: [],
      video_url: item.video?.video_url || '',
    });
    setPreviews([]);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      setLoading(true);
      try {
        await api.delete(`news/${id}/`);
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

  const renderMedia = (mediaItem) => {
    const filePath = mediaItem.file;
    console.log('File path:', filePath);
    if (!filePath) {
      console.warn('Invalid file path:', mediaItem);
      return null;
    }
    const isFullUrl = filePath.startsWith('http://') || filePath.startsWith('https://');
    const src = isFullUrl ? filePath : `http://localhost:8000${filePath}`;
    console.log('Media source:', src);
    const extension = filePath.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <img
          src={src}
          alt="News media"
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

  const renderVideoUrl = (videoUrl) => {
    if (!videoUrl) return null;
    // Basic YouTube URL parsing (extend for other platforms if needed)
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <iframe
          width="100"
          height="56"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ marginLeft: '10px' }}
        />
      );
    }
    return (
      <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>
        Video Link
      </a>
    );
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
        News Management
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
            style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}
          >
            Title
          </label>
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
          <label
            style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}
          >
            Description
          </label>
          <Editor
            apiKey="178cv5oebxeklcxtalz2v56clmn1535pb5bz90723sykv0jf"
            value={form.desc}
            onEditorChange={(content) => setForm({ ...form, desc: content })}
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
            style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}
          >
            Category
          </label>
          <select
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
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}
          >
            Type
          </label>
          <select
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
          >
            <option value="">Select Type</option>
            {types.map(t => (
              <option key={t.id} value={t.id.toString()}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}
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
        <div>
          <label
            style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}
          >
            Video URL (e.g., YouTube)
          </label>
          <input
            type="url"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px',
            }}
            placeholder="https://www.youtube.com/watch?v=..."
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
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update News' : 'Add News')}
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
          News List
        </h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : news.length === 0 ? (
          <p style={{ color: '#374151' }}>No news available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {news.map(item => (
              <li
                key={item.id}
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
                  <span>{item.title}</span>
                  {item.media &&
                    item.media.map((mediaItem, index) => (
                      <span key={index}>{renderMedia(mediaItem)}</span>
                    ))}
                  {item.video && renderVideoUrl(item.video.video_url)}
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(item)}
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
                    onClick={() => handleDelete(item.id)}
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

export default News;
