import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function Category({ user, onCategoriesUpdate }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ id: null, name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('categories/')
      .then(response => {
        console.log('Category data on fetch:', response.data);
        setCategories(response.data);
      })
      .catch(err => setError('Failed to fetch categories.'))
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
        url: editing ? `categories/${form.id}/` : 'categories/',
        data: { name: form.name },
      });
      const updatedCategory = response.data;
      if (editing) {
        setCategories(categories.map(c => c.id === form.id ? updatedCategory : c));
      } else {
        setCategories([...categories, updatedCategory]);
      }
      setForm({ id: null, name: '' });
      setEditing(false);
      setError('');
      if (onCategoriesUpdate) onCategoriesUpdate(categories.map(c => c.id === form.id ? updatedCategory : c));
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} category.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({ id: category.id, name: category.name });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        await api.delete(`categories/${id}/`);
        const updatedCategories = categories.filter(c => c.id !== id);
        setCategories(updatedCategories);
        if (onCategoriesUpdate) onCategoriesUpdate(updatedCategories);
      } catch (err) {
        setError('Failed to delete category.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
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
          {loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Category' : 'Add Category')}
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
            {categories.map(c => (
              <li key={c.id} style={{ padding: '8px', marginBottom: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                {c.name}
                <div>
                  <button onClick={() => handleEdit(c)} style={{ color: '#2563EB', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} style={{ color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Category;