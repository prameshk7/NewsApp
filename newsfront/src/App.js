import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/login'; 
import PubNewsDashboard from './components/pubNewsDashboard';
import api from './utils/axiosConfig';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      // Validate token by fetching user profile
      api.get('profile/')
        .then(response => {
          setUser({ ...response.data, token });
          localStorage.setItem('username', response.data.username);
          // Fetch categories and types
          Promise.all([
            api.get('categories/'),
            api.get('types/'),
          ])
            .then(([categoriesResponse, typesResponse]) => {
              setCategories(categoriesResponse.data);
              setTypes(typesResponse.data);
            })
            .catch(err => {
              console.error('Failed to fetch categories/types:', err);
              setError('Failed to load app data. Please try again.');
            })
            .finally(() => setLoading(false));
        })
        .catch(err => {
          console.error('Invalid token:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setUser(null);
          setLoading(false);
          navigate('/login');
        });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setCategories([]);
    setTypes([]);
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#DC2626' }}>
        {error}
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard/news" replace /> : <Login setUser={setUser} navigate={navigate} />}
      />
      <Route
        path="/dashboard/*"
        element={
          user ? (
            <PubNewsDashboard
              user={user}
              categories={categories}
              types={types}
              setCategories={setCategories}
              setTypes={setTypes}
              setUser={setUser}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? '/dashboard/news' : '/login'} replace />} />
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
