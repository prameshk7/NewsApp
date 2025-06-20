import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Blog({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ blg_title: '', desc: '', blg_image: [] });

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/blogs/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setBlogs(response.data));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:8000/api/v1/blogs/', form, {
      headers: { Authorization: `Token ${user.token}` }
    });
    setForm({ blg_title: '', desc: '', blg_image: [] });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Blogs</h2>
      <form onSubmit={handleSubmit} className="mb-4 bg-white p-4 shadow rounded">
        <input
          type="text"
          value={form.blg_title}
          onChange={(e) => setForm({ ...form, blg_title: e.target.value })}
          placeholder="Blog Title"
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          placeholder="Description"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          value={form.blg_image}
          onChange={(e) => setForm({ ...form, blg_image: e.target.value.split(',') })}
          placeholder="Image URLs (comma-separated)"
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Add Blog</button>
      </form>
      <ul>
        {blogs.map(blog => (
          <li key={blog.blg_id} className="bg-white p-2 mb-2 shadow rounded">{blog.blg_title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Blog;