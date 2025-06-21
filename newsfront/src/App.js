import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/login';
import PubNewsDashboard from './components/pubNewsDashboard';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token });
    }
    setLoading(false); // Set loading to false after checking
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Simple loading indicator
  }

  return (
    <Routes>
      {!user ? (
        <Route path="/login" element={<Login setUser={setUser} navigate={navigate} />} />
      ) : (
        <>
          <Route path="/dashboard/*" element={<PubNewsDashboard user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard/news" replace />} />
        </>
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