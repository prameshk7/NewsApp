import React, { useState, useEffect } from 'react';
import axios from 'axios';
<script src="https://cdn.tailwindcss.com"></script>

const NewsHome = () => {
    const [news, setNews] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [editingNews, setEditingNews] = useState(null);
    const [error, setError] = useState('');

    const API_URL = 'http://localhost:8000/';

    useEffect(() => {
        if (token) {
            axios.get(`${API_URL}news/`, {
                headers: { Authorization: `Token ${token}` }
            })
                .then(response => setNews(response.data))
                .catch(err => setError('Failed to fetch news: ' + err.message));
        }
    }, [token]);

    const handleLogin = () => {
        axios.post(`${API_URL}api-token-auth/`, { username: email, password })
            .then(response => {
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                setError('');
            })
            .catch(err => setError('Invalid credentials: ' + err.message));
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = () => {
        const data = { news_title: title, news_desc: desc };
        const config = { headers: { Authorization: `Token ${token}` } };

        if (editingNews) {
            axios.put(`${API_URL}news/${editingNews.id}/`, data, config)
                .then(response => {
                    setNews(news.map(n => n.id === editingNews.id ? response.data : n));
                    setEditingNews(null);
                    setTitle('');
                    setDesc('');
                })
                .catch(err => setError('Failed to update news: ' + err.message));
        } else {
            axios.post(`${API_URL}news/`, data, config)
                .then(response => {
                    setNews([response.data, ...news]);
                    setTitle('');
                    setDesc('');
                })
                .catch(err => setError('Failed to create news: ' + err.message));
        }
    };

    const handleDelete = (id) => {
        axios.delete(`${API_URL}news/${id}/`, { headers: { Authorization: `Token ${token}` } })
            .then(() => setNews(news.filter(n => n.id !== id)))
            .catch(err => setError('Failed to delete news: ' + err.message));
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        setTitle(newsItem.news_title);
        setDesc(newsItem.news_desc);
    };

    return (
        <div className="bg-black max-w-7xl mx-auto px-4 py-6 justify-center">
            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-center">{error}</div>}
            {!token ? (
                <div className="bg-black shadow-md rounded p-6 w-full max-w-md mx-auto">
                    <h4 className="text-xl font-semibold text-center mb-4">Login</h4>
                    <input
                        type="email"
                        className="w-full mb-3 p-2 border border-gray-300 rounded"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="w-full mb-3 p-2 border border-gray-300 rounded"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
                </div>
            ) : (
                <div className="bg-black shadow-md rounded p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">News Management</h2>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={handleLogout}>Logout</button>
                    </div>

                    <div className="mb-6">
                        <input
                            type="text"
                            className="w-full mb-2 p-2 border border-gray-300 rounded"
                            placeholder="Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full mb-2 p-2 border border-gray-300 rounded"
                            placeholder="Description"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                {editingNews ? 'Update' : 'Create'}
                            </button>
                            {editingNews && (
                                <button onClick={() => { setEditingNews(null); setTitle(''); setDesc(''); }} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border border-gray-200">
                            <thead>
                                <tr className="bg-black-100">
                                    <th className="border px-4 py-2 text-left">Id</th>
                                    <th className="border px-4 py-2 text-left">Title</th>
                                    <th className="border px-4 py-2 text-left">Description</th>
                                    <th className="border px-4 py-2 text-left">Date</th>
                                    <th className="border px-4 py-2 text-left">Author</th>
                                    <th className="border px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.length > 0 ? news.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="border px-4 py-2">{index + 1}</td>
                                        <td className="border px-4 py-2">{item.news_title}</td>
                                        <td className="border px-4 py-2">{item.news_desc}</td>
                                        <td className="border px-4 py-2">{new Date(item.published_date).toLocaleString()}</td>
                                        <td className="border px-4 py-2">{item.created_by || 'Unknown'}</td>
                                        <td className="border px-4 py-2 space-x-2">
                                            <button onClick={() => handleEdit(item)} className="text-yellow-500 hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-4">No news available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="mt-4 text-sm text-gray-600">Showing <b>{news.length}</b> out of <b>{news.length}</b> entries</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsHome;