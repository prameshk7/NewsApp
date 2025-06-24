import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function VideoManagement({ user }) {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ video_url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchUrl, setSearchUrl] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) {
      setError('You do not have permission to manage videos.');
      return;
    }
    setLoading(true);
    api.get('videos/')
      .then(response => setVideos(response.data))
      .catch(err => setError('Failed to fetch videos.'))
      .finally(() => setLoading(false));
  }, [user?.token, user?.is_superuser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.video_url) {
      setError('Video URL is required.');
      return;
    }
    setLoading(true);
    const data = { video_url: form.video_url };

    try {
      let response;
      const url = editing ? `videos/${form.id}/` : 'videos/';
      const method = editing ? api.put : api.post;

      response = await method(url, data);
      if (editing) {
        setVideos(videos.map(v => v.id === form.id ? response.data : v));
      } else {
        setVideos([...videos, response.data]);
      }
      setForm({ video_url: '' });
      setEditing(false);
      setError('');
      setIsFormVisible(false);
      setCurrentPage(1);
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
    setForm({ id: video.id, video_url: video.video_url });
    setEditing(true);
    setIsFormVisible(true);
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
        setSelectedIds(selectedIds => {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          return newSet;
        });
        if (videos.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Failed to delete video.');
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
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`videos/${id}/`)));
        setVideos(videos.filter(v => !selectedIds.has(v.id)));
        setSelectedIds(new Set());
        if (videos.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        setError('');
      } catch (err) {
        setError('Failed to delete selected videos.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredVideos = videos.filter(v => !searchUrl || v.video_url.toLowerCase().includes(searchUrl.toLowerCase()));
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Video List</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by URL"
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
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
        {isFormVisible ? 'Cancel' : 'Create Video'}
      </button>
      {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      {isFormVisible && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Video URL</label><input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }} disabled={loading} onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')} onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}>{loading ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Video' : 'Create Video')}</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        {loading ? <p style={{ color: '#374151' }}>Loading...</p> : paginatedVideos.length === 0 ? <p style={{ color: '#374151' }}>No videos available.</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(paginatedVideos.map(v => v.id)) : new Set())} /></th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>ID</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Video URL</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Option</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVideos.map(v => (
                  <tr key={v.id} style={{ backgroundColor: v.id % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}><input type="checkbox" checked={selectedIds.has(v.id)} onChange={(e) => setSelectedIds(prev => { const newSet = new Set(prev); e.target.checked ? newSet.add(v.id) : newSet.delete(v.id); return newSet; })} /></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{v.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}><a href={v.video_url} target="_blank" rel="noopener noreferrer">{v.video_url}</a></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>
                      <button onClick={() => handleEdit(v)} style={{ color: '#2563EB', border: 'none', background: 'none', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(v.id)} style={{ color: '#DC2626', border: 'none', background: 'none' }}>Delete</button>
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

export default VideoManagement;
