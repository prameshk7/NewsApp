import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/login';
import PubNewsDashboard from './components/pubNewsDashboard';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token });
      // Initial fetch of categories and types
      axios.get('http://localhost:8000/api/v1/categories/', { headers: { Authorization: `Token ${token}` } })
        .then(response => setCategories(response.data))
        .catch(err => console.error('Failed to fetch categories:', err));
      axios.get('http://localhost:8000/api/v1/types/', { headers: { Authorization: `Token ${token}` } })
        .then(response => setTypes(response.data))
        .catch(err => console.error('Failed to fetch types:', err));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Simple loading indicator
  }

  return (
    <Routes>
      {!user ? (
        <Route path="/login" element={<Login setUser={setUser} navigate={navigate} />} />
      ) : (
        <Route path="/dashboard/*" element={<PubNewsDashboard user={user} categories={categories} types={types} setCategories={setCategories} setTypes={setTypes} setUser={setUser} />} />
      )}
      <Route path="*" element={!user ? <Navigate to="/login" replace /> : <Navigate to="/dashboard/news" replace />} />
    </Routes>

    
  );
};


const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;