import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function Type({ user, onTypesUpdate }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ id: null, name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('types/')
      .then(response => {
        console.log('Type data on fetch:', response.data);
        setTypes(response.data);
      })
      .catch(err => setError('Failed to fetch types.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      const response = await api({
        method: editing ? 'put' : 'post',
        url: editing ? `types/${form.id}/` : 'types/',
        data: { name: form.name },
      });
      const updatedType = response.data;
      if (editing) {
        setTypes(types.map(t => t.id === form.id ? updatedType : t));
      } else {
        setTypes([...types, updatedType]);
      }
      setForm({ id: null, name: '' });
      setEditing(false);
      setError('');
      if (onTypesUpdate) onTypesUpdate(types.map(t => t.id === form.id ? updatedType : t));
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} type.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type) => {
    setForm({ id: type.id, name: type.name });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this type?')) {
      setLoading(true);
      try {
        await api.delete(`types/${id}/`);
        const updatedTypes = types.filter(t => t.id !== id);
        setTypes(updatedTypes);
        if (onTypesUpdate) onTypesUpdate(updatedTypes);
      } catch (err) {
        setError('Failed to delete type.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>Manage Types</h2>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Type' : 'Add Type')}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Types</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : types.length === 0 ? (
          <p style={{ color: '#374151' }}>No types available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {types.map(t => (
              <li key={t.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                {t.name}
                <div>
                  <button onClick={() => handleEdit(t)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Type;