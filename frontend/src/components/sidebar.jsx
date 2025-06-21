import React, { useState } from 'react';
import { FiMenu, FiX, FiNewspaper, FiAd, FiPen, FiUser, FiLogOut } from 'react-icons/fi';

export const AdminLayout = ({ 
  title = 'PubNews Admin', 
  sidebarItems = [
    { label: 'News', page: 'news' },
    { label: 'Adverts', page: 'adverts' },
    { label: 'Blogs', page: 'blog' },
    { label: 'Profile', page: 'user' },
  ],
  renderContent,
  currentPage,
  setCurrentPage,
  handleLogout,
  user,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'news': return <FiNewspaper />;
      case 'adverts': return <FiAd />;
      case 'blogs': return <FiPen />;
      case 'profile': return <FiUser />;
      default: return null;
    }
  };

  const sidebarStyle = {
    width: isCollapsed ? '80px' : '256px',
    backgroundColor: '#2C3B2A',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'width 0.3s ease-in-out',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  const headerStyle = {
    padding: '24px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const navStyle = {
    flexGrow: 1,
    overflowY: 'auto',
  };

  const ulStyle = {
    margin: '16px 0',
    padding: 0,
    listStyle: 'none',
  };

  const liStyle = (isActive) => ({
    padding: '16px 24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  });

  const liHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  };

  const bottomSectionStyle = {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '16px 0',
    marginBottom: '24px',
  };

  const logoutStyle = {
    padding: '16px 24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  };

  const logoutHoverStyle = {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    color: 'rgba(220, 53, 69, 0.7)',
  };

  const mainStyle = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '32px',
    background: 'linear-gradient(to bottom right, #D8E3DC, #C5D1C9)',
    marginLeft: isCollapsed ? '80px' : '256px',
    minHeight: '100vh',
  };

  const contentStyle = {
    maxWidth: '1152px',
    margin: '0 auto',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(to bottom right, #D8E3DC, #C5D1C9)' }}>
      <aside style={sidebarStyle}>
        <div style={headerStyle}>
          {!isCollapsed && title}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              transition: 'color 0.2s ease-in-out',
            }}
            onMouseOver={(e) => (e.target.style.color = '#FFFFFF')}
            onMouseOut={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.8)')}
          >
            {isCollapsed ? <FiMenu size={24} /> : <FiX size={24} />}
          </button>
        </div>
        <nav style={navStyle}>
          <ul style={ulStyle}>
            {sidebarItems.map((item, index) => (
              <li
                key={index}
                onClick={() => setCurrentPage(item.page)}
                style={liStyle(currentPage === item.page)}
                onMouseOver={currentPage !== item.page ? (e) => Object.assign(e.target.style, liHoverStyle) : null}
                onMouseOut={currentPage !== item.page ? (e) => Object.assign(e.target.style, { backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.7)' }) : null}
              >
                <span style={{ fontSize: '20px' }}>{getIcon(item.label)}</span>
                {!isCollapsed && <span style={{ fontSize: '16px' }}>{item.label}</span>}
              </li>
            ))}
          </ul>
        </nav>
        <div style={bottomSectionStyle}>
          <ul style={ulStyle}>
            <li
              onClick={() => setCurrentPage('profile')}
              style={liStyle(currentPage === 'profile')}
              onMouseOver={currentPage !== 'profile' ? (e) => Object.assign(e.target.style, liHoverStyle) : null}
              onMouseOut={currentPage !== 'profile' ? (e) => Object.assign(e.target.style, { backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.7)' }) : null}
            >
              <FiUser style={{ fontSize: '20px' }} />
              {!isCollapsed && <span style={{ fontSize: '16px' }}>Profile</span>}
            </li>
            <li
              onClick={handleLogout}
              style={logoutStyle}
              onMouseOver={(e) => Object.assign(e.target.style, logoutHoverStyle)}
              onMouseOut={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.7)' })}
            >
              <FiLogOut style={{ fontSize: '20px' }} />
              {!isCollapsed && <span style={{ fontSize: '16px' }}>Logout</span>}
            </li>
          </ul>
        </div>
      </aside>
      <main style={mainStyle}>
        <div style={contentStyle}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;