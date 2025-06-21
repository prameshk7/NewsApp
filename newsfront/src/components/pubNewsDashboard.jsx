import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './dashboardLayout';
import News from './news';
import Advert from './adverts';
import Blog from './blog';
import User from './user';

const PubNewsDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('news'); // Default page

  useEffect(() => {
    // Sync URL with currentPage on initial load or navigation
    const path = window.location.pathname.split('/dashboard/')[1] || 'news';
    if (currentPage !== path) {
      setCurrentPage(path);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const sidebarItems = () => [
    { label: 'News', page: 'news' },
    { label: 'Adverts', page: 'adverts' },
    { label: 'Blogs', page: 'blogs' },
    { label: 'User', page: 'user' },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'news': return <News user={user} />;
      case 'adverts': return <Advert user={user} />;
      case 'blogs': return <Blog user={user} />;
      case 'user': return <User user={user} />;
      default:
        return (
          <div style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#1E40AF',
                marginBottom: '8px',
              }}>Dashboard Overview</h2>
              <p style={{
                color: '#6B7280',
                marginBottom: '32px',
              }}>Welcome to your personal dashboard</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                marginBottom: '32px',
              }}>
                <div style={{
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}>
                  <h3 style={{ fontSize: '18px', color: '#1E40AF', marginBottom: '12px' }}>News Status</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>Active</p>
                </div>
                {/* Similar styling for other stat boxes */}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
              }}>
                <div style={{
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}>
                  <h3 style={{ fontSize: '18px', color: '#1E40AF', marginBottom: '16px' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button style={{
                      padding: '12px',
                      backgroundColor: '#2563EB',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                    }} onClick={() => setCurrentPage('news')}>
                      Manage News
                    </button>
                    {/* Similar styling for other buttons */}
                  </div>
                </div>
                {/* Similar styling for Updates section */}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
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