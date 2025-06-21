import React, { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiBox, FiFileText, FiImage, FiEdit } from 'react-icons/fi';

const DashboardLayout = ({ title, sidebarItems, renderContent, currentPage, setCurrentPage, handleLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = (label) => {
    switch(label.toLowerCase()) {
      case 'news': return <FiFileText />;
      case 'adverts': return <FiImage />;
      case 'blogs': return <FiEdit />;
      case 'user': return <FiUser />;
      case 'dashboard': return <FiHome />;
      default: return <FiBox />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(to bottom right, #EEF2FF, #E0E7FF)',
    }}>
      <aside style={{
        width: isCollapsed ? '80px' : '260px',
        backgroundColor: '#1E40AF',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {!isCollapsed && <h1 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#ffffff',
          }}>{title || "Dashboard"}</h1>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              color: '#ffffff',
              transition: 'background-color 0.3s ease',
            }}
          >
            {isCollapsed ? <FiMenu size={24} /> : <FiX size={24} />}
          </button>
        </div>

        <nav style={{ flexGrow: 1, marginTop: '20px' }}>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {sidebarItems.map((item, index) => (
              <li
                key={index}
                onClick={() => setCurrentPage(item.page)}
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: currentPage === item.page ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: currentPage === item.page ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.3s ease',
                  margin: '4px 8px',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{getIcon(item.label)}</span>
                {!isCollapsed && <span style={{ fontSize: '15px' }}>{item.label}</span>}
              </li>
            ))}
          </ul>
        </nav>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px',
          marginTop: 'auto',
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <FiLogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main style={{
        flexGrow: 1,
        padding: '32px',
        overflowY: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;