import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function Advert({ user }) {
  const [adverts, setAdverts] = useState([]);
  const [form, setForm] = useState({ id: null, ad_name: '', media: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchAdName, setSearchAdName] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    api.get('adverts/')
      .then(response => {
        console.log('Adverts data on fetch:', response.data);
        setAdverts(response.data);
      })
      .catch(err => setError('Failed to fetch adverts.'))
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
      e.target.value = '';
      return;
    }
    setForm({ ...form, media: files });
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ad_name) {
      setError('Ad name is required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('ad_name', form.ad_name);
    form.media.forEach(file => formData.append('media_files', file));

    try {
      let response;
      const url = editing ? `adverts/${form.id}/` : 'adverts/';
      const method = editing ? api.put : api.post;

      response = await method(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (editing) {
        setAdverts(adverts.map(item => item.id === form.id ? response.data : item));
      } else {
        setAdverts([...adverts, response.data]);
      }
      setForm({ id: null, ad_name: '', media: [] });
      setPreviews([]);
      setEditing(false);
      setError('');
      setIsFormVisible(false);
      setCurrentPage(1);
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} advert.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (advert) => {
    setForm({ id: advert.id, ad_name: advert.ad_name, media: [] });
    setPreviews([]);
    setEditing(true);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advert?')) {
      setLoading(true);
      try {
        await api.delete(`adverts/${id}/`);
        setAdverts(adverts.filter(item => item.id !== id));
        setSelectedIds(selectedIds => {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          return newSet;
        });
        if (adverts.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Failed to delete advert.');
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
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`adverts/${id}/`)));
        setAdverts(adverts.filter(item => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
        if (adverts.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        setError('');
      } catch (err) {
        setError('Failed to delete selected adverts.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderMedia = (mediaItem) => {
    const filePath = mediaItem.file;
    if (!filePath) return null;
    const isFullUrl = filePath.startsWith('http://') || filePath.startsWith('https://');
    const src = isFullUrl ? filePath : `http://localhost:8000${filePath}`;
    const extension = filePath.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <img src={src} alt="Advert media" style={{ width: '50px', height: '50px', objectFit: 'cover' }} loading="lazy" />;
    }
    return null;
  };

  const renderPreview = (previewUrl, index) => {
    const extension = previewUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <img src={previewUrl} alt={`Preview ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }} />;
    }
    return null;
  };

  // Filter and search logic
  const filteredAdverts = adverts.filter(item => {
    const matchesAdName = !searchAdName || item.ad_name.toLowerCase().includes(searchAdName.toLowerCase());
    return matchesAdName;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAdverts.length / itemsPerPage);
  const paginatedAdverts = filteredAdverts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Advert List</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Ad Name"
            value={searchAdName}
            onChange={(e) => setSearchAdName(e.target.value)}
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
        {isFormVisible ? 'Cancel' : 'Create Advert'}
      </button>
      {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      {isFormVisible && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Ad Name</label><input type="text" value={form.ad_name} onChange={(e) => setForm({ ...form, ad_name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Media Files (Images, GIFs, Videos)</label><input type="file" multiple accept="image/*,video/*,image/gif" onChange={handleFileChange} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} disabled={loading} />{previews.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>{previews.map((preview, index) => <div key={index}>{renderPreview(preview, index)}</div>)}</div>}</div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }} disabled={loading} onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')} onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}>{loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Advert' : 'Add Advert')}</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        {loading ? <p style={{ color: '#374151' }}>Loading...</p> : paginatedAdverts.length === 0 ? <p style={{ color: '#374151' }}>No adverts available.</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(paginatedAdverts.map(item => item.id)) : new Set())} /></th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>ID</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Image</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Ad Name</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Options</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdverts.map(item => (
                  <tr key={item.id} style={{ backgroundColor: item.id % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}><input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => setSelectedIds(prev => { const newSet = new Set(prev); e.target.checked ? newSet.add(item.id) : newSet.delete(item.id); return newSet; })} /></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{item.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{item.media && item.media.length > 0 && renderMedia(item.media[0])}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{item.ad_name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>
                      <button onClick={() => handleEdit(item)} style={{ color: '#2563EB', border: 'none', background: 'none', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: '#DC2626', border: 'none', background: 'none' }}>Delete</button>
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

export default Advert;