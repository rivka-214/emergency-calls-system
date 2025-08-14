# מערכת חירום למתנדבים - React + Node/NET

מערכת זו מאפשרת ניהול קריאות חירום, מתנדבים, משתמשים, עזרה ראשונה ועוד.

## תכונות עיקריות
- **הרשמת מתנדבים ומשתמשים**
- **התחברות ואימות משתמשים**
- **יצירת קריאת חירום**
- **הצגת סטטוס קריאה ועדכון סטטוס מתנדב**
- **רשימת מתנדבים מוקצים לקריאה**
- **הוראות עזרה ראשונה אוטומטיות**
- **עדכון פרטי מתנדב**
- **היסטוריית קריאות**
- **התראות, ניווט אוטומטי, טיפול בשגיאות**

## מבנה הפרויקט
```
ReactProject/
├── public/                # קבצים סטטיים (תמונות, סאונדים, favicon)
├── src/
│   ├── App.tsx            # רכיב ראשי
│   ├── components/        # רכיבי UI
│   ├── pages/             # דפי מערכת (הרשמה, התחברות, קריאות, מתנדבים)
│   ├── services/          # שירותי API (קריאות, מתנדבים, עזרה ראשונה)
│   ├── auth/              # ניהול session ואימות
│   ├── contexts/          # Contexts גלובליים
│   ├── hooks/             # Hooks מותאמים אישית
│   ├── layouts/           # Layouts עיצוביים
│   ├── routes/            # ניתוב בין דפים
│   ├── style/             # קבצי CSS
│   ├── types/             # טיפוסים (TypeScript)
│   └── Utils/             # פונקציות עזר
├── package.json           # תלותים והגדרות npm
├── tsconfig.json          # הגדרות TypeScript
└── README.md              # מדריך זה
```

## התקנה והרצה
1. התקנת תלויות:
   ```bash
   npm install
   ```
2. הרצת פיתוח:
   ```bash
   npm start
   ```
3. בניית פרויקט:
   ```bash
   npm run build
   ```

## קבצים חשובים
- `src/pages/RegisterVolunteerPage.tsx` - הרשמת מתנדב
- `src/pages/Volunteer/LoginPage.tsx` - התחברות מתנדב
- `src/pages/Volunteer/VolunteerUpdatePage.tsx` - עדכון פרטי מתנדב
- `src/pages/Call/CallConfirmationPage.tsx` - אישור קריאה
- `src/services/volunteer.service.ts` - שירות מתנדבים
- `src/services/calls.service.ts` - שירות קריאות
- `src/services/firstAid.ts` - שירות עזרה ראשונה

## טכנולוגיות
- React, TypeScript
- Axios (קריאות API)
- React Router (ניווט)
- CSS מותאם
- .NET/Node.js (שרת)

## הערות
- יש להגדיר את כתובת השרת בקבצי השירותים לפי הסביבה.
- התמונות והסאונדים נמצאים ב־`public/images` ו־`public/sounds`.
- יש להפעיל את השרת במקביל ל־client.

## תרומה
כל תרומה/הצעה/דיווח באג תתקבל בברכה!

---
בהצלחה!

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
