import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function Advert({ user }) {
  const [adverts, setAdverts] = useState([]);
  const [form, setForm] = useState({ ad_name: '', media: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);

  useEffect(() => {
      setLoading(true);
      api.get('adverts/')
        .then(response => {
          console.log('Advert data on fetch:', response.data);
          setAdverts(response.data);
        })
        .catch(err => setError('Failed to fetch adverts.'))
        .finally(() => setLoading(false));
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ad_name) {
      setError('Ad name is required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('ad_name', form.ad_name);
    form.media.forEach((file, index) => formData.append(`media[${index}]file`, file));

    try {
      let response;
      const url = editing ? `adverts/${selectedAdvertId}/` : 'adverts/';
      const method = editing ? api.put : api.post;

      response = await method(url, formData);
      if (editing) {
        setAdverts(adverts.map(item => item.id === selectedAdvertId ? response.data : item));
      } else {
        setAdverts([...adverts, response.data]);
      }
      setForm({ ad_name: '', media: [] });
      setEditing(false);
      setSelectedAdvertId(null);
      setError('');
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} advert.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (advert) => {
    setForm({ ad_name: advert.ad_name, media: [] });
    setEditing(true);
    setSelectedAdvertId(advert.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advert?')) {
      setLoading(true);
      try {
        await api.delete(`adverts/${id}/`);
        setAdverts(adverts.filter(item => item.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete advert.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderMedia = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    const src = `http://localhost:8000${filePath}`;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <img src={src} alt="Advert media" style={{ width: '50px', marginLeft: '10px' }} />;
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return (
        <video controls style={{ width: '50px', marginLeft: '10px' }}>
          <source src={src} type={`video/${extension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>Advert Management</h2>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Ad Name</label>
          <input
            type="text"
            value={form.ad_name}
            onChange={(e) => setForm({ ...form, ad_name: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Media Files (Images, GIFs, Videos)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*,image/gif"
            onChange={(e) => setForm({ ...form, media: Array.from(e.target.files) })}
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
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Advert' : 'Add Advert')}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Advert List</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : adverts.length === 0 ? (
          <p style={{ color: '#374151' }}>No adverts available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {adverts.map(advert => (
              <li key={advert.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {advert.ad_name} {advert.media && advert.media.length > 0 && renderMedia(advert.media[0].file)}
                </div>
                <div>
                  <button onClick={() => handleEdit(advert)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(advert.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Advert;