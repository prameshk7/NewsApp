import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
                .catch(err => setError('Failed to fetch news'));
        }
    }, [token]);

    const handleLogin = () => {
        axios.post(`${API_URL}api-token-auth/`, { email, password })
            .then(response => {
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                setError('');
            })
            .catch(err => setError('Invalid credentials'));
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
                .catch(err => setError('Failed to update news'));
        } else {
            axios.post(`${API_URL}news/`, data, config)
                .then(response => {
                    setNews([response.data, ...news]);
                    setTitle('');
                    setDesc('');
                })
                .catch(err => setError('Failed to create news'));
        }
    };

    const handleDelete = (id) => {
        axios.delete(`${API_URL}news/${id}/`, { headers: { Authorization: `Token ${token}` } })
            .then(() => setNews(news.filter(n => n.id !== id)))
            .catch(err => setError('Failed to delete news'));
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        setTitle(newsItem.news_title);
        setDesc(newsItem.news_desc);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">News Portal</h1>

            {error && <p className="text-red-500">{error}</p>}

            {!token ? (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <button
                        onClick={handleLogin}
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        Login
                    </button>
                </div>
            ) : (
                <div className="mb-4">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white p-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            )}

            {token && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">{editingNews ? 'Edit News' : 'Add News'}</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="border p-2 w-full mb-2"
                    />
                    <textarea
                        placeholder="Description"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="border p-2 w-full mb-2"
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white p-2 rounded"
                    >
                        {editingNews ? 'Update' : 'Create'}
                    </button>
                    {editingNews && (
                        <button
                            onClick={() => { setEditingNews(null); setTitle(''); setDesc(''); }}
                            className="bg-gray-500 text-white p-2 rounded ml-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}

            <h2 className="text-xl font-semibold mb-2">News List</h2>
            <div className="grid gap-4">
                {news.map(item => (
                    <div key={item.id} className="border p-4 rounded">
                        <h3 className="text-lg font-bold">{item.news_title}</h3>
                        <p>{item.news_desc}</p>
                        <p className="text-sm text-gray-600">
                            Published: {new Date(item.published_date).toLocaleString()} | By: {item.created_by}
                        </p>
                        {token && (
                            <div className="mt-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-yellow-500 text-white p-1 rounded mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-500 text-white p-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsHome;