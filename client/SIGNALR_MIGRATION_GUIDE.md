# מעבר מפולינג ל-SignalR - מדריך שימוש

## סקירה כללית

המערכת עברה מפולינג (בדיקה כל 2-3 שניות) ל-SignalR (WebSocket) לקבלת הודעות על קריאות חירום במזמן אמת.

## מה השתנה?

### לפני (Polling):
```javascript
// בדיקה כל 2 שניות
setInterval(async () => {
  const calls = await getAssignedCalls(volunteerId, 'notified');
  // עדכון UI
}, 2000);
```

### אחרי (SignalR):
```javascript
// חיבור WebSocket
connection.on('CallAssigned', (callDetails) => {
  // עדכון מיידי בזמן אמת
});
```

## קבצים חדשים שנוצרו:

### 1. `SignalRVolunteerCallWatcher.tsx`
הקומפוננט החדש שמשתמש ב-SignalR במקום פולינג

### 2. `CallWatcher.tsx`
קומפוננט מאחד שמאפשר לבחור בין SignalR לפולינג

### 3. `notifications.config.ts`
קובץ הגדרות מרכזי לניהול התצורה

### 4. `NotificationDebugPanel.tsx`
פאנל דיבוג לבדיקת מצב החיבור

## איך להשתמש:

### שינוי מצב (SignalR ⟷ Polling):
ערוך את הקובץ `src/config/notifications.config.ts`:

```typescript
export const NOTIFICATION_CONFIG = {
  USE_SIGNALR: true,  // true = SignalR, false = Polling
  // ...
};
```

### שינוי הגדרות SignalR:
```typescript
SIGNALR: {
  HUB_URL: 'https://localhost:7219/notificationHub',
  AUTO_RECONNECT: true,
  LOG_LEVEL: 'Information',
}
```

### הוספת דפים חדשים למעקב:
```typescript
ALLOWED_PATHS: [
  '/volunteerPage',
  '/VolunteerListPage',
  // הוסף כאן דפים נוספים
]
```

## בדיקת המערכת:

1. **פאנל דיבוג**: לחץ על כפתור "Debug 🔧" בתחתית השמאל בדף המתנדבים
2. **קונסול הדפדפן**: בדוק הודעות התחברות ואירועים
3. **Network Tab**: ודא שאין בקשות HTTP מיותרות (פולינג)

## סטטוס נוכחי:

✅ **SignalR מופעל כברירת מחדל**
- דף `/volunteerPage` משתמש ב-SignalR
- שאר הדפים עדיין משתמשים בפולינג

## הוראות הפעלה מלאה:

### שלב 1: ודא שהשרת פועל עם SignalR
```bash
# ודא שהשרת מאזין על https://localhost:7219
# ו-NotificationHub זמין
```

### שלב 2: החלף כל הדפים ל-SignalR
ב-`Router.jsx`, החלף את `UnifiedVolunteerCallWatcher` ב-`CallWatcher`:

```jsx
// במקום זה:
element: <><UnifiedVolunteerCallWatcher /><Component /></>

// השתמש בזה:
element: <><CallWatcher /><Component /></>
```

### שלב 3: בדוק פעולה תקינה
1. פתח דף מתנדב
2. צור קריאה חדשה (במזמן אמת)
3. ודא שהקריאה מגיעה מיד ללא עיכוב

## טיפים לפתרון בעיות:

### אם SignalR לא עובד:
1. בדוק חיבור לשרת (CORS, HTTPS)
2. ודא שהטוקן תקף
3. בדוק שה-volunteerId קיים ב-localStorage
4. העבר זמנית חזרה לפולינג: `USE_SIGNALR: false`

### מעקב אחר בעיות:
```javascript
// פתח קונסול והריץ:
localStorage.setItem('signalr-debug', 'true');
// לביטול:
localStorage.removeItem('signalr-debug');
```

## יתרונות המעבר ל-SignalR:

- 🚀 **מהירות**: הודעות מיידיות במקום עיכוב של עד 2-3 שניות
- ⚡ **ביצועים**: חיסכון במשאבי שרת וקליינט
- 🔋 **סוללה**: פחות בקשות = חיסכון בסוללה בסמארטפון
- 📱 **חוויית משתמש**: תגובה מיידית לאירועים

## מעבר הדרגתי:

אפשר לעבור בהדרגה על ידי שינוי דף אחר דף:

```jsx
// דף אחד עם SignalR
<CallWatcher useSignalR={true} />

// דף אחר עם פולינג
<CallWatcher useSignalR={false} />

// דף עם ברירת מחדל (מההגדרות)
<CallWatcher />
```
