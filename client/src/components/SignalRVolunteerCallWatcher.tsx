import React, { useEffect, useRef } from 'react';
import { useCallContext } from '../contexts/CallContext';
import { useLocation } from 'react-router-dom';
import { NOTIFICATION_CONFIG } from '../config/notifications.config';
import { Call } from '../types/call.types';
import { signalRService } from '../services/signalR.service';

const SignalRVolunteerCallWatcher: React.FC = () => {
  const { setPopupCall } = useCallContext();
  const location = useLocation();
  const isInitialized = useRef(false);

  // useEffect נפרד לבדיקת נתיבים - ללא חיבור מחדש
  useEffect(() => {
    if (!NOTIFICATION_CONFIG.ALLOWED_PATHS.includes(location.pathname)) {
      console.info('🚫 Current path not allowed for notifications:', location.pathname);
      console.info('📋 Allowed paths:', NOTIFICATION_CONFIG.ALLOWED_PATHS);
      return;
    }
    console.info('✅ Current path allowed for notifications:', location.pathname);
  }, [location.pathname]);

  // useEffect נפרד לחיבור SignalR - רק פעם אחת
  useEffect(() => {
    const volunteerId = localStorage.getItem('volunteerId');
    const token = localStorage.getItem('token');

    if (!volunteerId || !token) {
      console.warn('SignalR stopped: No valid volunteerId or token.');
      console.warn('volunteerId:', volunteerId, 'token:', token ? 'Present' : 'Missing');
      return;
    }

    console.log('🔗 Starting SignalR connection for volunteerId:', volunteerId);

    const initializeSignalR = async () => {
      try {
        // התחלת החיבור
        await signalRService.startConnection(volunteerId, token);

        // הגדרת מאזין לקבלת קריאות
        signalRService.onCallAssigned((callDetails) => {
          // בדיקה אם הדף הנוכחי מורשה
          const currentPath = window.location.pathname;
          if (!NOTIFICATION_CONFIG.ALLOWED_PATHS.includes(currentPath)) {
            console.info('🚫 Call received but current path not allowed:', currentPath);
            return;
          }

          console.log('🚨 קריאה חדשה התקבלה דרך SignalR:', callDetails);
          console.log('📍 פרטי הקריאה:', {
            callId: callDetails.callId,
            description: callDetails.description,
            callerName: callDetails.callerName,
            location: `${callDetails.locationX}, ${callDetails.locationY}`
          });
          
          // המרת הנתונים לפורמט שהמערכת מצפה לו
          const formattedCall = {
            id: callDetails.callId,
            locationX: callDetails.locationX,
            locationY: callDetails.locationY,
            date: callDetails.date || new Date().toISOString(),
            description: callDetails.description,
            urgencyLevel: 1,
            status: (callDetails.status || 'Open') as "Open" | "InProgress" | "Closed",
            userId: 0,
            imageUrl: callDetails.image,
            callerName: callDetails.callerName
          } as Call & { callerName: string };

          setPopupCall((prevPopupCall) => {
            if (prevPopupCall?.id === formattedCall.id) {
              console.info('Popup already set for this call. Skipping.');
              return prevPopupCall;
            }
            console.log('📢 popupCall updated successfully with:', formattedCall);
            return formattedCall;
          });
        });

        isInitialized.current = true;

      } catch (error) {
        console.error('❌ Failed to initialize SignalR:', error);
      }
    };

    if (!isInitialized.current) {
      initializeSignalR();
    }

    // ניקוי החיבור בעת יציאה מהקומפוננט
    return () => {
      if (isInitialized.current) {
        console.log('🔌 Cleaning up SignalR connection');
        signalRService.stopConnection();
        isInitialized.current = false;
      }
    };
  }, [setPopupCall]); // הסרנו את location.pathname מהתלות

  return null;
};

export default SignalRVolunteerCallWatcher;
