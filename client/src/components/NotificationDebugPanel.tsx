import React, { useState } from 'react';
import { NOTIFICATION_CONFIG, shouldUseSignalR } from '../config/notifications.config';

const NotificationDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const currentMode = shouldUseSignalR() ? 'SignalR' : 'Polling';
  
  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Debug 🔧
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      minWidth: '300px',
      zIndex: 1000,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <strong>Notification Debug Panel</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Current Mode:</strong> <span style={{ color: currentMode === 'SignalR' ? 'green' : 'orange' }}>{currentMode}</span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>SignalR URL:</strong> {NOTIFICATION_CONFIG.SIGNALR.HUB_URL}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Auto Reconnect:</strong> {NOTIFICATION_CONFIG.SIGNALR.AUTO_RECONNECT ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Log Level:</strong> {NOTIFICATION_CONFIG.SIGNALR.LOG_LEVEL}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Volunteer ID:</strong> {localStorage.getItem('volunteerId') || 'Not found'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Allowed Paths:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          {NOTIFICATION_CONFIG.ALLOWED_PATHS.map(path => (
            <li key={path} style={{ 
              color: window.location.pathname === path ? 'green' : 'black',
              fontWeight: window.location.pathname === path ? 'bold' : 'normal'
            }}>
              {path}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ 
        fontSize: '10px', 
        color: '#666', 
        marginTop: '10px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        💡 כדי לשנות מצב, ערוך את NOTIFICATION_CONFIG.USE_SIGNALR בקובץ notifications.config.ts
      </div>
    </div>
  );
};

export default NotificationDebugPanel;
