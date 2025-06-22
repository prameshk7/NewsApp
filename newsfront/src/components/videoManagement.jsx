import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function VideoManagement({ user }) {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ video_url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    if (!user || !user.is_staff || user.is_superuser) {
      setError('You do not have permission to manage videos.');
      return;
    }
    setLoading(true);
    api.get('videos/')
      .then(response => setVideos(response.data))
      .catch(err => setError('Failed to fetch videos.'))
      .finally(() => setLoading(false));
  }, [user?.token, user?.is_staff, user?.is_superuser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.is_staff || user?.is_superuser) {
      setError('You do not have permission to perform this action.');
      return;
    }
    if (!form.video_url) {
      setError('Video URL is required.');
      return;
    }
    setLoading(true);
    const data = { video_url: form.video_url };

    try {
      let response;
      const url = editing ? `videos/${selectedVideoId}/` : 'videos/';
      const method = editing ? api.put : api.post;

      response = await method(url, data);
      if (editing) {
        setVideos(videos.map(v => v.id === selectedVideoId ? response.data : v));
      } else {
        setVideos([...videos, response.data]);
      }
      setForm({ video_url: '' });
      setEditing(false);
      setSelectedVideoId(null);
      setError('');
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'create'} video. ${err.response?.data?.error || ''}`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video) => {
    if (video.created_by?.id !== user.id) {
      setError('You cannot edit this video.');
      return;
    }
    setForm({ video_url: video.video_url });
    setEditing(true);
    setSelectedVideoId(video.id);
  };

  const handleDelete = async (id) => {
    if (!user.is_staff || user.is_superuser || window.confirm('Are you sure you want to delete this video?')) {
      const videoToDelete = videos.find(v => v.id === id);
      if (videoToDelete && videoToDelete.created_by?.id !== user.id) {
        setError('You cannot delete this video.');
        return;
      }
      setLoading(true);
      try {
        await api.delete(`videos/${id}/`);
        setVideos(videos.filter(v => v.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete video.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user?.is_staff || user?.is_superuser) {
    return <div style={{ padding: '24px', color: '#DC2626' }}>Access Denied: Only managers can manage videos.</div>;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>Video Management</h2>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Video URL</label>
          <input
            type="url"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
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
          {loading ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Video' : 'Create Video')}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Videos</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : videos.length === 0 ? (
          <p style={{ color: '#374151' }}>No videos available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {videos.map(v => (
              <li key={v.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                Video {v.id} - <a href={v.video_url} target="_blank" rel="noopener noreferrer">{v.video_url}</a>
                <div>
                  <button onClick={() => handleEdit(v)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(v.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VideoManagement;