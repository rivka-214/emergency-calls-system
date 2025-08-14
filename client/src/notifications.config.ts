export const NOTIFICATION_CONFIG = {
  // ✅ השרת מוכן לSignalR! אפשר להפעיל
  USE_SIGNALR: true, 
  
  // הגדרות SignalR (מוכן לשימוש!)
  SIGNALR: {
    HUB_URL: 'https://localhost:7219/notificationHub',
    LOG_LEVEL: 'Information', // None, Critical, Error, Warning, Information, Debug, Trace
    AUTOMATIC_RECONNECT: true,
    RECONNECT_INTERVALS: [0, 2000, 10000, 30000] // מילישניות
  },
  
  // הגדרות Polling (כגיבוי)
  POLLING: {
    INTERVAL: 3000, // מילישניות
    ENABLED: false // SignalR פועל במקום
  },
  
  // נתיבים מותרים עבור התראות
  ALLOWED_PATHS: [
    '/volunteerPage',
    '/VolunteerListPage', 
    '/VolunteerHistoryPage',
    '/VolunteerUpdatePage',
    '/MyCallsPage'
  ],
  
  // הגדרות כלליות
  DEBUG_MODE: true,
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_DELAY: 5000, // מילישניות
  
  // הודעת סטטוס למפתחים
  STATUS_MESSAGE: '🎉 SignalR מוכן לפעולה! השרת תומך בהתראות בזמן אמת.'
};

export type NotificationConfig = typeof NOTIFICATION_CONFIG;
