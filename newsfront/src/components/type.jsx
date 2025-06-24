import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

function Type({ user, onTypesUpdate }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ id: null, name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchName, setSearchName] = useState('');
  const itemsPerPage = 10;

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
      setIsFormVisible(false);
      setCurrentPage(1);
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
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this type?')) {
      setLoading(true);
      try {
        await api.delete(`types/${id}/`);
        const updatedTypes = types.filter(t => t.id !== id);
        setTypes(updatedTypes);
        setSelectedIds(selectedIds => {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          return newSet;
        });
        if (types.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        if (onTypesUpdate) onTypesUpdate(updatedTypes);
      } catch (err) {
        setError('Failed to delete type.');
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
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`types/${id}/`)));
        const updatedTypes = types.filter(t => !selectedIds.has(t.id));
        setTypes(updatedTypes);
        setSelectedIds(new Set());
        if (types.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        if (onTypesUpdate) onTypesUpdate(updatedTypes);
        setError('');
      } catch (err) {
        setError('Failed to delete selected types.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredTypes = types.filter(t => !searchName || t.name.toLowerCase().includes(searchName.toLowerCase()));
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const paginatedTypes = filteredTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Type List</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
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
        {isFormVisible ? 'Cancel' : 'Create Type'}
      </button>
      {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      {isFormVisible && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }} disabled={loading} onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')} onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}>{loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Type' : 'Add Type')}</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        {loading ? <p style={{ color: '#374151' }}>Loading...</p> : paginatedTypes.length === 0 ? <p style={{ color: '#374151' }}>No types available.</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(paginatedTypes.map(t => t.id)) : new Set())} /></th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>ID</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Name</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Option</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTypes.map(t => (
                  <tr key={t.id} style={{ backgroundColor: t.id % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}><input type="checkbox" checked={selectedIds.has(t.id)} onChange={(e) => setSelectedIds(prev => { const newSet = new Set(prev); e.target.checked ? newSet.add(t.id) : newSet.delete(t.id); return newSet; })} /></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{t.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{t.name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>
                      <button onClick={() => handleEdit(t)} style={{ color: '#2563EB', border: 'none', background: 'none', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(t.id)} style={{ color: '#DC2626', border: 'none', background: 'none' }}>Delete</button>
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

export default Type;
