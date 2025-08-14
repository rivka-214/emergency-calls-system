// EmergencyPage.tsx - דף התרעות חירום עם עיצוב מהפכני
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, Phone, Zap, MapPin, Clock } from "lucide-react";
import BackgroundLayout from "../../layouts/BackgroundLayout";
import { createCall, assignNearbyVolunteers } from "../../services/calls.service";
import "../../style/emergency-modern.css"; // עיצוב חדש ומגניב
import type { CallResponse } from "../../types/call.types";

export default function EmergencyPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ x: string; y: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // עדכון שעה כל שנייה
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // קבלת מיקום
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          x: pos.coords.latitude.toString(),
          y: pos.coords.longitude.toString(),
        }),
      () => alert("⚠️ לא הצלחנו לאתר מיקום")
    );

    return () => clearInterval(timer);
  }, []);

  const sendSosCall = async () => {
    if (!location) {
      alert("📍 אין מיקום זמין עדיין");
      return;
    }

    // וידוא שהמיקום תקין
    const lat = Number.parseFloat(location.x);
    const lng = Number.parseFloat(location.y);
    if (isNaN(lat) || isNaN(lng)) {
      alert("📍 מיקום לא תקין - אנא נסה שוב");
      return;
    }

    try {
      // שליחת קריאה עם כל השדות הנדרשים
      const sosCallData = {
        description: "🆘 קריאת SOS דחופה - נדרשת עזרה מיידית! 🚨",
        urgencyLevel: 4, // קריטית
        locationX: lng, // longitude
        locationY: lat, // latitude
      };
      const response = await createCall(sosCallData);
      const callId = response.data.id;
      
      // שיוך מתנדבים קרובים לקריאת SOS
      try {
        console.log("🚨 Assigning volunteers to SOS call:", callId);
        await assignNearbyVolunteers(callId);
        console.log("✅ Volunteers assigned to SOS call successfully");
      } catch (assignError) {
        console.error("❌ Failed to assign volunteers to SOS call:", assignError);
        // אל תעצור את התהליך - הקריאה נוצרה בהצלחה
      }
      
      navigate(`/call-confirmation/${callId}`, {
        state: {
          callId,
          message: "🆘 קריאת SOS נשלחה בהצלחה! מתנדבים בדרך אליך",
          firstAidSuggestions: [],
        },
      });
    } catch (error: any) {
      let errorMessage = "שגיאה בשליחת קריאת SOS";
      if (error.message && error.message.includes("Validation errors:")) {
        errorMessage = `שגיאות אימות:\n${error.message.replace("Validation errors:\n", "")}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(errorMessage);
    }
  };

  return (
    <BackgroundLayout>
      <div className="emergency-page-modern">
        {/* Header מינימליסטי */}
        <div className="emergency-header-modern">
          <div className="status-indicators">
            <div className="status-item">
              <Clock className="status-icon" />
              <span>{currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="status-item">
              <MapPin className="status-icon" />
              <span className={location ? "location-ready" : "location-loading"}>
                {location ? "מיקום זוהה" : "מאתר..."}
              </span>
            </div>
          </div>
          
          <div className="hero-content-modern">
            <h1 className="hero-title-modern">
              <span className="title-emergency">חירום</span>
              <span className="title-system">מערכת התרעות</span>
            </h1>
            <p className="hero-subtitle-modern">שליחת קריאה מהירה לצוותי החירום</p>
          </div>
        </div>

        {/* כפתורי פעולה מודרניים */}
        <div className="action-buttons-container">
          {/* כפתור ראשי - שלח קריאה */}
          <button 
            className="primary-action-btn"
            onClick={() => navigate("/CreateCallPage")}
          >
            <div className="btn-content-wrapper">
              <div className="btn-icon-circle">
                <Phone className="btn-main-icon" />
                <div className="icon-pulse-ring"></div>
              </div>
              <div className="btn-text-content">
                <h2 className="btn-title">שלח קריאה</h2>
                <p className="btn-subtitle">דווח על מצב חירום עכשיו</p>
              </div>
              <div className="btn-arrow">
                <div className="arrow-line"></div>
                <div className="arrow-head"></div>
              </div>
            </div>
          </button>

          {/* כפתור SOS דחוף */}
          {/* <button 
            className="sos-action-btn"
            onClick={sendSosCall}
          >
            <div className="sos-content-wrapper">
              <div className="sos-icon-container">
                <Zap className="sos-main-icon" />
                <div className="sos-lightning-effect"></div>
                <div className="sos-ripple-1"></div>
                <div className="sos-ripple-2"></div>
                <div className="sos-ripple-3"></div>
              </div>
              <div className="sos-text-content">
                <span className="sos-label">SOS</span>
                <span className="sos-subtitle">דחוף</span>
              </div>
            </div> */}
          {/* </button> */}
        </div>

        {/* מידע מהיר */}
        <div className="quick-info-modern">
          <div className="info-card-modern">
            <div className="info-icon-modern">⚡</div>
            <div className="info-content-modern">
              <h4>תגובה מהירה</h4>
              <p>2-4 דקות</p>
            </div>
          </div>
          <div className="info-card-modern">
            <div className="info-icon-modern">�</div>
            <div className="info-content-modern">
              <h4>מתנדבים זמינים</h4>
              <p>24/7</p>
            </div>
          </div>
          <div className="info-card-modern">
            <div className="info-icon-modern">�️</div>
            <div className="info-content-modern">
              <h4>מיקום מאובטח</h4>
              <p>מוצפן</p>
            </div>
          </div>
        </div>

        {/* אזהרת מיקום */}
        {!location && (
          <div className="location-warning">
            <AlertCircle className="warning-icon" />
            <span>מחכה לאישור מיקום...</span>
          </div>
        )}
      </div>
    </BackgroundLayout>
  );
}
