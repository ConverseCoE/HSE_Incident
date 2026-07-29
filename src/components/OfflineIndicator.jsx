import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineIndicator = () => {
  const { isOnline, toggleNetwork, offlinePending, syncOfflineData } = useDatabase();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (isOnline && offlinePending.length > 0) {
      setSyncing(true);
      const timer = setTimeout(() => {
        syncOfflineData();
        setSyncing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, offlinePending.length]);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={toggleNetwork}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'none',
          border: '1px solid var(--border-color)',
          color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        title={isOnline ? `Online (Click to go Offline) ${offlinePending.length ? `• ${offlinePending.length} drafts ready` : ''}` : 'Offline (Click to go Online)'}
      >
        {syncing ? (
          <RefreshCw size={18} className="sync-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
        ) : isOnline ? (
          <Wifi size={18} />
        ) : (
          <WifiOff size={18} />
        )}

        {offlinePending.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--accent-gold)',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '0.62rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            {offlinePending.length}
          </span>
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;
