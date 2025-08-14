import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getCallStatus } from "../../services/calls.service";
import { getVolunteersForCall, updateVolunteerStatus, finishVolunteerCall } from "../../services/calls.service";
import { getLocalFirstAidGuide } from "../../services/firstAid"; // פונקציה ל-POST /api/Ask/first-aid
import BackgroundLayout from "../../layouts/BackgroundLayout";
import "../../style/emergency-styles.css";

export default function CallConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const callId = (location.state as any)?.callId;
  const description = (location.state as any)?.description || "";

  const [status, setStatus] = useState("נשלחה");
  const [guides, setGuides] = useState<{ title: string; description: string }[]>([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);

  // סטטוס הקריאה כל 3 שניות
  useEffect(() => {
    if (!callId) return;

    const interval = setInterval(async () => {
      try {
        const response = await getCallStatus(callId);
        setStatus(response.data.status);
      } catch (err) {
        if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.status === 401) {
          navigate("/login");
        } else {
          console.error("שגיאה בקבלת סטטוס", err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [callId]);

  // הוראות עזרה ראשונה מ-POST /api/Ask/first-aid
  useEffect(() => {
    const fetchGuideFromLocal = async () => {
      if (!description) return;

      setIsLoadingGuides(true);
      try {
        // קריאה לשרת שלך
const localGuide = await getLocalFirstAidGuide(description);
setGuides([{ title: "הוראות עזרה ראשונה", description: localGuide }]);
      } catch (err) {
        console.error("שגיאה בקבלת הוראות עזרה ראשונה מהשרת המקומי", err);
      } finally {
        setIsLoadingGuides(false);
      }
    };

    fetchGuideFromLocal();
  }, [description]);

  const fetchVolunteers = async () => {
    if (!callId) {
      console.error("Missing callId");
      return;
    }

    setIsLoadingVolunteers(true);
    try {
      const response = await getVolunteersForCall(callId);
      setVolunteers(response.data);
    } catch (err) {
      if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.status === 401) {
        navigate("/login");
      } else {
        console.error("שגיאה בקבלת רשימת מתנדבים", err);
      }
    } finally {
      setIsLoadingVolunteers(false);
    }
  };

  const handleArrivedUpdate = async () => {
    if (status !== 'נפתח') {
      alert('לא ניתן לעדכן ל-"הגעתי" לפני שהסטטוס הוא "נפתח".');
      return;
    }

    setIsLoadingVolunteers(true);
    try {
      await updateVolunteerStatus(callId, 176, 'arrived');
      setStatus('בטיפול');
    } catch (error) {
      alert('שגיאה בעדכון הסטטוס, נסה שוב');
    } finally {
      setIsLoadingVolunteers(false);
    }
  };

  const handleCompleteCall = async (summary: { summary: string; sentToHospital: boolean; hospitalName?: string }) => {
    setIsLoadingVolunteers(true);
    try {
      await finishVolunteerCall(callId, 176, summary);
      setStatus('נסגר');
    } catch (error) {
      alert('שגיאה בסיום הקריאה, נסה שוב');
    } finally {
      setIsLoadingVolunteers(false);
    }
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "נשלחה":
        return "#ef4444";
      case "נפתח":
        return "#f59e0b";
      case "בטיפול":
        return "#10b981";
      case "נסגר":
        return "#6b7280";
      default:
        return "#9ca3af";
    }
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case "נשלחה":
        return "📤";
      case "נפתח":
        return "�";
      case "בטיפול":
        return "🚑";
      case "נסגר":
        return "✅";
      default:
        return "📋";
    }
  };

  return (
    <BackgroundLayout>
      <div className="confirmation-container">
        {/* כותרת ראשית עם הדגשה אדומה */}
        <div className="emergency-success-banner">
          <div className="confirmation-icon">🚨</div>
          <h2>קריאת חירום נשלחה!</h2>
          <p className="call-sent-indicator">✅ הקריאה התקבלה בהצלחה</p>
          <p>מתנדבים מוכשרים הוזעקו ויגיעו בהקדם האפשרי</p>
        </div>

        {/* פרטי הקריאה */}
        <div className="call-details-section">
          <h2 className="section-title">📋 פרטי הקריאה</h2>
          <div className="confirmation-card">
            <div className="confirmation-header">
              <div className="confirmation-icon">🆔</div>
              <h3>מידע על הקריאה</h3>
            </div>
            <div className="call-info-grid">
              <div className="call-info-item">
                <div className="call-info-label">מספר קריאה</div>
                <div className="call-info-value">#{callId}</div>
              </div>
              <div className="call-info-item">
                <div className="call-info-label">סטטוס נוכחי</div>
                <div className="call-info-value">
                  <span className="emergency-status-badge" style={{ backgroundColor: getStatusColor(status) }}>
                    {getStatusIcon(status)} {status}
                  </span>
                </div>
              </div>
              {description && (
                <div className="call-info-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="call-info-label">תיאור המצב</div>
                  <div className="call-info-value description-text">{description}</div>
                </div>
              )}
              <div className="call-info-item">
                <div className="call-info-label">זמן יצירה</div>
                <div className="call-info-value">{new Date().toLocaleString('he-IL')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* הודעת התראה */}
        <div className="alert-section">
          <div className="volunteers-notified">
            <div className="confirmation-icon">🚑</div>
            <h3>מתנדבים הוזעקו!</h3>
            <div className="volunteer-count">🚨</div>
            <p>אנא הישאר במקום ושמור על קשר</p>
            <div className="emergency-tip">
              💡 מתנדבים מוכשרים בעזרה ראשונה יגיעו בהקדם האפשרי למיקומך
            </div>
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div className="emergency-actions">
          <h3>⚡ פעולות זמינות</h3>
          <div className="action-buttons-grid">
            <button className="action-btn primary" onClick={() => navigate("/my-calls")}>
              <span className="btn-icon">📋</span>
              <span className="btn-text">הקריאות שלי</span>
            </button>
            
            <button className="action-btn secondary" onClick={fetchVolunteers}>
              <span className="btn-icon">👥</span>
              <span className="btn-text">רשימת מתנדבים</span>
            </button>
            
            <button className="action-btn neutral" onClick={() => navigate("/")}>
              <span className="btn-icon">🏠</span>
              <span className="btn-text">חזור לבית</span>
            </button>
          </div>
        </div>

        {/* הוראות עזרה ראשונה */}
        {(guides.length > 0 || isLoadingGuides) && (
          <div className="guides-section">
            <h2 className="section-title">🩺 הוראות עזרה ראשונה</h2>
            {isLoadingGuides ? (
              <div className="loading-card">
                <div className="loading-spinner"></div>
                <span className="loading-text">טוען הוראות עזרה ראשונה...</span>
              </div>
            ) : (
              <div className="guides-container">
                {guides.map((guide, index) => (
                  <div key={index} className="guide-card">
                    <div className="guide-header">
                      <h3 className="guide-title">{guide.title}</h3>
                    </div>
                    <div className="guide-content">
                      <p className="guide-description">{guide.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* רשימת מתנדבים */}
        {isLoadingVolunteers ? (
          <div className="volunteers-section">
            <h2 className="section-title">👥 מתנדבים</h2>
            <div className="loading-card">
              <div className="loading-spinner"></div>
              <span className="loading-text">טוען רשימת מתנדבים...</span>
            </div>
          </div>
        ) : volunteers.length > 0 ? (
          <div className="volunteers-section">
            <h2 className="section-title">👥 מתנדבים מוקצים</h2>
            <div className="volunteers-grid">
              {volunteers.map((volunteer: any, index) => (
                <div key={index} className="volunteer-card">
                  <div className="volunteer-info">
                    <div className="volunteer-name">{volunteer.fullName}</div>
                    <div className="volunteer-details">
                      <span className="volunteer-phone">📞 {volunteer.phoneNumber}</span>
                      <span className="volunteer-city">📍 {volunteer.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* הודעת זהירות */}
        <div className="warning-section">
          <div className="emergency-alert">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h3>הודעה חשובה</h3>
              <p>
                הוראות אלו הן לעזרה ראשונה בלבד ואינן מחליפות טיפול רפואי מקצועי.
                במקרה של חירום רפואי חמור, אנא המתן למתנדבים שיבואו.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}