import React from 'react';
import UnifiedVolunteerCallWatcher from './GlobalVolunteerCallWatcher';
import SignalRVolunteerCallWatcher from './SignalRVolunteerCallWatcher';
import { NOTIFICATION_CONFIG } from '../notifications.config';

interface CallWatcherProps {
  useSignalR?: boolean;
}

const CallWatcher: React.FC<CallWatcherProps> = ({ useSignalR }) => {
  // אם לא הועבר פרמטר, השתמש בהגדרת ברירת המחדל
  const shouldUseSignalRMode = useSignalR !== undefined ? useSignalR : NOTIFICATION_CONFIG.USE_SIGNALR;
  
  if (shouldUseSignalRMode) {
    console.log('🔗 Using SignalR for call notifications');
    return <SignalRVolunteerCallWatcher />;
  }
  
  console.log('⏰ Using Polling for call notifications (SignalR disabled due to server issues)');
  return <UnifiedVolunteerCallWatcher />;
};

export default CallWatcher;
