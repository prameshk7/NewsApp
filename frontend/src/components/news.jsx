import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News({ user }) {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', desc: '', category: '', type: '', images: [] });

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/news/', {
      headers: { Authorization: `Token ${user.token}` }
    }).then(response => setNews(response.data));
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:8000/api/v1/news/', form, {
      headers: { Authorization: `Token ${user.token}` }
    });
    setForm({ title: '', desc: '', category: '', type: '', images: [] });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">News</h2>
      <form onSubmit={handleSubmit} className="mb-4 bg-white p-4 shadow rounded">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
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
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Category"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          placeholder="Type"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value.split(',') })}
          placeholder="Image URLs (comma-separated)"
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Add News</button>
      </form>
      <ul>
        {news.map(item => (
          <li key={item.id} className="bg-white p-2 mb-2 shadow rounded">{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default News;