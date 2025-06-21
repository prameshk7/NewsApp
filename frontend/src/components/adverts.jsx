import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Advert({ user }) {
  const [adverts, setAdverts] = useState([]);
  const [form, setForm] = useState({ ad_name: '', ad_images: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/v1/adverts/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setAdverts(response.data))
      .catch(err => setError('Failed to fetch adverts.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ad_name) {
      setError('Ad name is required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/adverts/', form, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setAdverts([...adverts, response.data]);
      setForm({ ad_name: '', ad_images: [] });
      setError('');
    } catch (err) {
      setError('Failed to add advert.');
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
      }}>Advert Management</h2>
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
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Ad Name</label>
          <input
            type="text"
            value={form.ad_name}
            onChange={(e) => setForm({ ...form, ad_name: e.target.value })}
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
            value={form.ad_images.join(',')}
            onChange={(e) => setForm({ ...form, ad_images: e.target.value.split(',') })}
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
          {loading ? 'Adding...' : 'Add Advert'}
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
        }}>Advert List</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : adverts.length === 0 ? (
          <p style={{ color: '#374151' }}>No adverts available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {adverts.map(advert => (
              <li key={advert.id} style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: '#F9FAFB',
                borderRadius: '4px',
              }}>
                {advert.ad_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Advert;