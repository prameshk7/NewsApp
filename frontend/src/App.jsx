import React, { useState } from 'react';
import Login from './components/login';
import Advert from './components/advert';
import Blog from './components/blog';
import News from './components/news';
import User from './components/user';

function App() {
  const [activeSection, setActiveSection] = useState('login');
  const [user, setUser] = useState(null);

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
          <nav className="bg-white p-4 mb-4 shadow">
            <ul className="flex space-x-4">
              <li><button onClick={() => setActiveSection('news')} className="text-blue-500 hover:text-blue-700">News</button></li>
              <li><button onClick={() => setActiveSection('advert')} className="text-blue-500 hover:text-blue-700">Adverts</button></li>
              <li><button onClick={() => setActiveSection('blog')} className="text-blue-500 hover:text-blue-700">Blogs</button></li>
              <li><button onClick={() => setActiveSection('user')} className="text-blue-500 hover:text-blue-700">Profile</button></li>
              <li><button onClick={() => { setUser(null); setActiveSection('login'); }} className="text-red-500 hover:text-red-700">Logout</button></li>
            </ul>
          </nav>
          {renderSection()}
        </div>
      ) : (
        renderSection()
      )}
    </div>
  );
}

export default App;