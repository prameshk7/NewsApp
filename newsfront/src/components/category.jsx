import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Category({ user, onCategoriesUpdate }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/v1/categories/', { headers: { Authorization: `Token ${user.token}` } })
      .then(response => setCategories(response.data))
      .catch(err => setError('Failed to fetch categories.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/categories/', form, {
        headers: { Authorization: `Token ${user.token}` },
      });
      setCategories([...categories, response.data]);
      setForm({ name: '' });
      setError('');
      if (onCategoriesUpdate) onCategoriesUpdate([...categories, response.data]);
    } catch (err) {
      setError('Failed to add category.');
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/api/v1/categories/${id}/`, {
        headers: { Authorization: `Token ${user.token}` },
      });
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      if (onCategoriesUpdate) onCategoriesUpdate(updatedCategories);
    } catch (err) {
      setError('Failed to delete category.');
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '24px' }}>Manage Categories</h2>
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
            onChange={(e) => setForm({ name: e.target.value })}
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
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      <div style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Categories</h3>
        {loading ? (
          <p style={{ color: '#374151' }}>Loading...</p>
        ) : categories.length === 0 ? (
          <p style={{ color: '#374151' }}>No categories available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {categories.map(cat => (
              <li key={cat.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                {cat.name}
                <button onClick={() => handleDelete(cat.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Category;