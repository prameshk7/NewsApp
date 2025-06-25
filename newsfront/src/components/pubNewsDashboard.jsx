import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from './dashboardLayout';
import News from './news';
import Advert from './adverts';
import Blog from './blog';
import Category from './category';
import Type from './type';
import UserAdminManagement from './userAdminManagement';
import User from './user';
import VideoManagement from './videoManagement';

const PubNewsDashboard = ({ user, categories, types, setCategories, setTypes, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('news'); // Default page

  useEffect(() => {
    console.log('User object in dashboard:', user); // Debug log
    const path = location.pathname.split('/dashboard/')[1] || 'news';
    if (currentPage !== path) {
      setCurrentPage(path);
    }
  }, [location.pathname, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    navigate('/login');
  };

  const sidebarItems = () => {
    const items = [
      { label: 'News', page: 'news' },
      { label: 'Adverts', page: 'adverts' },
      { label: 'Blogs', page: 'blogs' },
      { label: 'User', page: 'user' },
      { label: 'Categories', page: 'categories' },
      { label: 'Types', page: 'types' },,
      { label:'Videos', page:'video' }
    ];
    if (user && user.is_staff && !user.is_superuser) { // Add null check
      items.push({ label: 'User Management', page: 'user-management' });
    } else {
      console.log('User management hidden. is_staff:', user?.is_staff, 'is_superuser:', user?.is_superuser); // Debug log
    }
    return items;
  };

  const renderContent = () => {
    if ((!user?.is_staff || user?.is_superuser) && currentPage === 'user-management') {
      return <div style={{ padding: '24px', color: '#DC2626' }}>Access Denied: Only managers can manage users.</div>;
    }
    switch (currentPage) {
      case 'news': return <News user={user} categories={categories} types={types} />;
      case 'categories': return <Category user={user} onCategoriesUpdate={setCategories} />;
      case 'types': return <Type user={user} onTypesUpdate={setTypes} />;
      case 'adverts': return <Advert user={user} />;
      case 'blogs': return <Blog user={user} />;
      case 'user': return <User user={user} />;
      case 'video': return <VideoManagement user={user} />;
      case 'user-management': return <UserAdminManagement user={user} />;
      default:
        return (
          <div style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1E40AF', marginBottom: '8px' }}>Dashboard Overview</h2>
              <p style={{ color: '#6B7280', marginBottom: '32px' }}>Welcome to your personal dashboard</p>
              {/* Overview content */}
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title="Dashboard"
      sidebarItems={sidebarItems()}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      handleLogout={handleLogout}
      renderContent={renderContent}
      user={user}
    />
  );
};

export default PubNewsDashboard;