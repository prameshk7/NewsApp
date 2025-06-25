import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { Editor } from '@tinymce/tinymce-react';

function Blog({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ blg_title: '', blg_desc: '', media: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTitle, setSearchTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    api.get('blogs/')
      .then(response => {
        console.log('Blog data on fetch:', response.data);
        setBlogs(response.data);
      })
      .catch(err => setError('Failed to fetch blogs.'))
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
    if (!form.blg_title || !form.blg_desc) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('blg_title', form.blg_title);
    formData.append('blg_desc', form.blg_desc);
    form.media.forEach(file => formData.append('media_files', file));

    try {
      let response;
      const url = editing ? `blogs/${form.id}/` : 'blogs/';
      const method = editing ? api.put : api.post;

      response = await method(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (editing) {
        setBlogs(blogs.map(item => item.blg_id === form.id ? response.data : item));
      } else {
        setBlogs([...blogs, response.data]);
      }
      setForm({ blg_title: '', blg_desc: '', media: [] });
      setPreviews([]);
      setEditing(false);
      setError('');
      setIsFormVisible(false);
      setCurrentPage(1);
    } catch (err) {
      setError(`Failed to ${editing ? 'update' : 'add'} blog.`);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setForm({ id: blog.blg_id, blg_title: blog.blg_title, blg_desc: blog.blg_desc, media: [] });
    setPreviews([]);
    setEditing(true);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setLoading(true);
      try {
        await api.delete(`blogs/${id}/`);
        setBlogs(blogs.filter(item => item.blg_id !== id));
        setSelectedIds(selectedIds => {
          const newSet = new Set(selectedIds);
          newSet.delete(id);
          return newSet;
        });
        if (blogs.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Failed to delete blog.');
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
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`blogs/${id}/`)));
        setBlogs(blogs.filter(item => !selectedIds.has(item.blg_id)));
        setSelectedIds(new Set());
        if (blogs.length <= itemsPerPage * (currentPage - 1) + 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        setError('');
      } catch (err) {
        setError('Failed to delete selected blogs.');
        console.error(err.response?.data);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderMedia = (mediaItem) => {
    const filePath = mediaItem.image;
    if (!filePath) return null;
    const isFullUrl = filePath.startsWith('http://') || filePath.startsWith('https://');
    const src = isFullUrl ? filePath : `http://localhost:8000${filePath}`;
    const extension = filePath.split('.').pop().toLowerCase();

    const handleClick = () =>{
      setModalContent(src);
      setIsModalOpen(true);
    }

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <div onClick={handleClick} style={{ cursor: 'pointer', display: 'inline-block' }}>
          <img
            src={src}
            alt="News thumbnail"
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => {
              console.error(`Failed to load image: ${src}`);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span style={{ display: 'none' }}>Failed to load</span>
        </div>
      );
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return (
        <div onClick={handleClick} style={{ cursor: 'pointer', display: 'inline-block' }}>
          <video
            width="50"
            height="50"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              console.error(`Failed to load video: ${src}`);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          >
            <source src={src} type={`video/${extension}`} />
          </video>
          <span style={{ display: 'none' }}>Failed to load</span>
        </div>
      );
    }
    return <span>No media</span>;
  };

  const renderPreview = (previewUrl, index) => {
    const extension = previewUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <img src={previewUrl} alt={`Preview ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }} />;
    }
    return null;
  };

  const filteredBlogs = blogs.filter(b => !searchTitle || b.blg_title.toLowerCase().includes(searchTitle.toLowerCase()));
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

    const Modal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: 'relative',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '60%',
            maxHeight: '60%',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            X
          </button>
          {content && content.includes('youtube.com') ? (
            <iframe
              width="560"
              height="315"
              src={content}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          ) : content && ['mp4', 'webm', 'ogg'].some(ext => content.toLowerCase().endsWith(ext)) ? (
            <video
              width="560"
              height="315"
              controls
              autoPlay
            >
              <source src={content} type={`video/${content.split('.').pop().toLowerCase()}`} />
              Your browser does not support the video tag.
            </video>
          ) : content && ['jpg', 'jpeg', 'png', 'gif'].some(ext => content.toLowerCase().endsWith(ext)) ? (
            <img
              src={content}
              alt="Popup media"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2A44', marginBottom: '16px' }}>Blog List</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{ padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', flexGrow: 1 }}
          />
          <button
            onClick={handleBulkDelete}
            style={{ padding: '8px 16px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Bulk Delete
          </button>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} content={modalContent} />
      </div>
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        style={{ padding: '10px 20px', backgroundColor: '#1D4ED8', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px' }}
      >
        {isFormVisible ? 'Cancel' : 'Create Blog'}
      </button>
      {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      {isFormVisible && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Blog Title</label><input type="text" value={form.blg_title} onChange={(e) => setForm({ ...form, blg_title: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} required disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label><Editor apiKey="178cv5oebxeklcxtalz2v56clmn1535pb5bz90723sykv0jf" value={form.blg_desc} onEditorChange={(content) => setForm({ ...form, blg_desc: content })} init={{ height: '200px', menubar: false, plugins: ['lists', 'link', 'image', 'code'], toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image code' }} disabled={loading} /></div>
            <div><label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Media Files (Images, GIFs, Videos)</label><input type="file" multiple accept="image/*,video/*,image/gif" onChange={handleFileChange} style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '16px' }} disabled={loading} />{previews.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>{previews.map((preview, index) => <div key={index}>{renderPreview(preview, index)}</div>)}</div>}</div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }} disabled={loading} onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#059669')} onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#10B981')}>{loading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Blog' : 'Add Blog')}</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        {loading ? <p style={{ color: '#374151' }}>Loading...</p> : paginatedBlogs.length === 0 ? <p style={{ color: '#374151' }}>No blogs available.</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(paginatedBlogs.map(b => b.blg_id)) : new Set())} /></th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>ID</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Title</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Image</th>
                  <th style={{ padding: '8px', borderBottom: '2px solid #D1D5DB' }}>Option</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBlogs.map(blog => (
                  <tr key={blog.blg_id} style={{ backgroundColor: blog.blg_id % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}><input type="checkbox" checked={selectedIds.has(blog.blg_id)} onChange={(e) => setSelectedIds(prev => { const newSet = new Set(prev); e.target.checked ? newSet.add(blog.blg_id) : newSet.delete(blog.blg_id); return newSet; })} /></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{blog.blg_id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{blog.blg_title}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>{blog.images && blog.images.map((mediaItem, index) => <span key={index}>{renderMedia(mediaItem)}</span>)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #D1D5DB' }}>
                      <button onClick={() => handleEdit(blog)} style={{ color: '#2563EB', border: 'none', background: 'none', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(blog.blg_id)} style={{ color: '#DC2626', border: 'none', background: 'none' }}>Delete</button>
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

export default Blog;