import React from 'react';
import { useUser } from '../context/UserContext';
import { Shield, ChevronDown } from 'lucide-react';

const RoleSelector = () => {
  const { currentUser, setCurrentUser, usersList } = useUser();

  const handleChange = (e) => {
    const selectedUser = usersList.find(u => u.id === e.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  return (
    <div className="role-selector-container" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '6px 12px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
    }}>
      <Shield size={16} className="text-muted" style={{ color: 'var(--accent-cyan)' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Active Role</span>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <select 
            value={currentUser.id} 
            onChange={handleChange}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              paddingRight: '20px',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              width: '180px'
            }}
          >
            {usersList.map(u => (
              <option key={u.id} value={u.id} style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 0, pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
