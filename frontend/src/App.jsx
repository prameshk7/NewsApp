import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Advert from './components/adverts';
import Blog from './components/blog';
import News from './components/news';
import User from './components/user';
import axios from 'axios';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      setUser({ username: localStorage.getItem('username'), token });
    }
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'login':
        return <Login setUser={setUser} setActiveSection={setActiveSection} />;
      case 'advert':
        return user ? <Advert user={user} /> : <Login setUser={setUser} setActiveSection={setActiveSection} />;
      case 'blog':
        return user ? <Blog user={user} /> : <Login setUser={setUser} setActiveSection={setActiveSection} />;
      case 'news':
        return user ? <News user={user} /> : <Login setUser={setUser} setActiveSection={setActiveSection} />;
      case 'user':
        return user ? <User user={user} /> : <Login setUser={setUser} setActiveSection={setActiveSection} />;
      default:
        return <Login setUser={setUser} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <div className="container mx-auto p-4">
          {renderSection()}
        </div>
      ) : (
        renderSection()
      )}
    </div>
  );
}

export default App;