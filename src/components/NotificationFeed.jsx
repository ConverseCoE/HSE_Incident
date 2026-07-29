import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Bell, Check, Trash2 } from 'lucide-react';

const NotificationFeed = ({ onSelectIncident }) => {
  const { notifications, setNotifications } = useDatabase();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleFeed = () => setIsOpen(!isOpen);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (n) => {
    // Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setIsOpen(false);
    if (onSelectIncident) {
      onSelectIncident(n.incidentId);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={toggleFeed}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'var(--accent-red)',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-red)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          right: 0,
          top: '50px',
          width: '360px',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 99,
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Workplace Notifications</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead} 
                  title="Mark all as read"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Check size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll} 
                  title="Clear all"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '320px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No active notifications.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(6, 182, 212, 0.04)',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  className="notification-item-hover"
                >
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: n.read ? 400 : 600,
                    color: n.title.includes('CRITICAL') || n.title.includes('ALERT') ? 'var(--accent-red)' : 'var(--text-primary)'
                  }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <style>{`
        .notification-item-hover:hover {
          background: rgba(255, 255, 255, 0.03) !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationFeed;
