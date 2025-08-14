import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BackgroundLayout from '../../layouts/BackgroundLayout';
import { getVolunteerCallsHistory, getVolunteerDetails } from '../../services/volunteer.service';
import '../../style/VolunteerHistoryPage.css';
import '../../style/emergency-styles.css';

export default function VolunteerCallHistoryPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const volunteerId = await getVolunteerDetails();
        if (!volunteerId) throw new Error('מתנדב לא מזוהה');
        const res = await getVolunteerCallsHistory();
        setCalls(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('❌ שגיאה בטעינת היסטוריית הקריאות:', error);
        alert('שגיאה בטעינת היסטוריית קריאות');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatStatus = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case 'open': 
      case 'פתוח':
        return 'פתוחה';
      case 'inprogress':
      case 'in_progress': 
      case 'בטיפול':
        return 'בטיפול';
      case 'closed':
      case 'נסגר':
      case 'הושלם':
      case 'finished':
        return 'הושלמה';
      default: 
        return status || 'לא ידוע';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '---';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '---';
      return date.toLocaleString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '---';
    }
  };

  const formatUrgencyLevel = (level: number | string | null | undefined) => {
    if (!level) return '---';
    const numLevel = typeof level === 'string' ? parseInt(level) : level;
    switch (numLevel) {
      case 1: return 'נמוכה';
      case 2: return 'בינונית';
      case 3: return 'גבוהה';
      case 4: return 'קריטית';
      default: return level?.toString() || '---';
    }
  };

  return (
    <BackgroundLayout>
      <div className="history-wrapper">
        <div className="history-container">
          <div className="history-header">
            <button onClick={handleGoBack} className="back-button">
              <ArrowRight className="back-icon" />
              חזור
            </button>
            <h2>📖 היסטוריית קריאות</h2>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>טוען נתונים...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>אין קריאות להצגה</h3>
              <p>עדיין לא השתתפת בקריאות חירום</p>
            </div>
          ) : (
            <div className="calls-grid">
              {calls.map((item, index) => {
                const call = item.call || {};
                return (
                  <div key={call.id || index} className="call-card">
                    <div className="call-header">
                      <span className="call-number">#{call.id || index + 1}</span>
                      <span className={`status-badge status-${item.volunteerStatus?.toLowerCase() || 'unknown'}`}>
                        {formatStatus(item.volunteerStatus)}
                      </span>
                    </div>
                    <div className="call-content">
                      <div className="call-section">
                        <h4>תיאור הקריאה</h4>
                        <p>{call.description || 'אין תיאור זמין'}</p>
                      </div>
                      <div className="call-details">
                        <div className="detail-item">
                          <strong>תאריך:</strong>
                          <span>{formatDate(call.date)}</span>
                        </div>
                        <div className="detail-item">
                          <strong>רמת דחיפות:</strong>
                          <span className={`urgency-level urgency-${call.urgencyLevel}`}>
                            {formatUrgencyLevel(call.urgencyLevel)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>מיקום:</strong>
                          <span>
                            {(call.locationX && call.locationY)
                              ? `(${call.locationY}, ${call.locationX})`
                              : 'מיקום לא זמין'
                            }
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>מס' מתנדבים:</strong>
                          <span>{item.goingVolunteersCount ?? '---'}</span>
                        </div>
                        <div className="detail-item">
                          <strong>נשלח לבי"ח:</strong>
                          <span className={call.sentToHospital ? 'sent-yes' : 'sent-no'}>
                            {call.sentToHospital ? '✔️ כן' : '❌ לא'}
                          </span>
                        </div>
                        {call.hospitalName && (
                          <div className="detail-item">
                            <strong>שם בי"ח:</strong>
                            <span>{call.hospitalName}</span>
                          </div>
                        )}
                      </div>
                      {call.summary && (
                        <div className="call-section">
                          <h4>סיכום</h4>
                          <p className="summary-text">{call.summary}</p>
                        </div>
                      )}
                      {(call.arrImage || call.fileImage) && (
                        <div className="call-section">
                          <h4>תמונה</h4>
                          <a
                            href={call.arrImage || call.fileImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="image-link"
                          >
                            📷 צפייה בתמונה
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BackgroundLayout>
  );
}