// הגדרות למערכת הודעות
export const NOTIFICATION_CONFIG = {
  // true = SignalR, false = Polling
  USE_SIGNALR: true,
  
  // הגדרות SignalR
  SIGNALR: {
    HUB_URL: 'https://localhost:7219/notificationHub',
    AUTO_RECONNECT: true,
    LOG_LEVEL: 'Information', // None, Critical, Error, Warning, Information, Debug, Trace
  },
  
  // הגדרות Polling (במקרה של חזרה לפולינג)
  POLLING: {
    INTERVAL_MS: 2000, // 2 שניות
  },
  
  // דפים מותרים למעקב אחר קריאות
  ALLOWED_PATHS: [
    '/',
    '/volunteerPage',
    '/VolunteerListPage',
    '/volunteer/update-details',
    '/volunteer/active-calls',
    '/volunteer/history',
    '/volunteer/menu',
    '/my-calls',
  ]
};

// פונקציה לקבלת ההגדרה הנוכחית
export const shouldUseSignalR = () => NOTIFICATION_CONFIG.USE_SIGNALR;
