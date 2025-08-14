import React, { useState } from 'react';
import { Phone, MapPin, Clock, Users, AlertCircle, CheckCircle, User } from 'lucide-react';
import { updateVolunteerStatus } from '../services/volunteer.service';
import CloseCallPage from './CloseCallForm';
import '../style/emergency-styles.css';

// Types
interface Call {
  id: number;
  address: string;
  description: string;
  priority: string;
  timestamp: string;
  status: string;
  type: string;
}

interface VolunteerCall {
  callsId: number;
  volunteerId: number;
  volunteerStatus?: string;
  responseTime?: string;
  call: Call;
  goingVolunteersCount: number;
}

// Background Layout Component
const BackgroundLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
};

// Active Call Card Component
export interface ActiveCallCardProps {
  volunteerCall: VolunteerCall;
  onStatusUpdate: () => void;
  showArrivedOnly?: boolean;
}

const ActiveCallCard: React.FC<ActiveCallCardProps> = ({ volunteerCall, onStatusUpdate, showArrivedOnly }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCloseCallPage, setShowCloseCallPage] = useState(false);
  const [currentVolunteerStatus, setCurrentVolunteerStatus] = useState(volunteerCall.volunteerStatus);
  const [actualGoingCount, setActualGoingCount] = useState(volunteerCall.goingVolunteersCount);

  const { call, callsId, volunteerId, responseTime, goingVolunteersCount } = volunteerCall;

  // Handle arrived button click
  const handleArrivedClick = async () => {
    setIsLoading(true);
    try {
      await updateVolunteerStatus(callsId, 'arrived');
      setCurrentVolunteerStatus('arrived');
      // קריאה מיידית לעדכון הדף הראשי כדי לקבל נתונים חדשים מהשרת
      onStatusUpdate(); 
    } catch (error) {
      console.error('Error updating volunteer status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close call page
  const handleCloseCallPage = () => {
    setShowCloseCallPage(false);
  };

  // פונקציה לעדכון מספר המתנדבים בדרך
  const updateGoingVolunteersCount = async () => {
    try {
      // כאן נוכל לעשות קריאה לשרת לקבל את המספר המעודכן
      // לעת עתה נעדכן בהתאם לשינוי הסטטוס המקומי
      if (currentVolunteerStatus === 'Going' || currentVolunteerStatus === 'בדרך') {
        setActualGoingCount(prev => Math.max(1, prev)); // וודא שיש לפחות 1
      }
    } catch (error) {
      console.error('Error updating going volunteers count:', error);
    }
  };

  // עדכון מספר המתנדבים כשהסטטוס משתנה
  React.useEffect(() => {
    updateGoingVolunteersCount();
  }, [currentVolunteerStatus]);

  return (
    <>
      <div className="active-call-card">
        {/* Header with gradient background */}
        <div className="call-card-header">
          <div className="call-header-left">
            <div className="call-id-section">
              <div className="call-icon">
                <Phone className="h-6 w-6" />
              </div>
              <div className="call-id-text">
                <span className="call-number">קריאה #{call.id}</span>
                <span className="call-type">{call.type}</span>
              </div>
            </div>
            <div className={`priority-badge priority-${call.priority?.toLowerCase()}`}>
              <AlertCircle className="h-4 w-4" />
              <span>{call.priority}</span>
            </div>
          </div>
          <div className={`status-badge status-${call.status?.toLowerCase()}`}>
            <CheckCircle className="h-4 w-4" />
            <span>{call.status}</span>
          </div>
        </div>

        {/* Call Details with modern layout */}
        <div className="call-details-section">
          <div className="detail-row">
            <div className="detail-icon">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="detail-content">
              <span className="detail-label">כתובת</span>
              <p className="detail-value">{call.address}</p>
            </div>
            <button
              className="map-button"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(call.address)}`, '_blank')}
              title="פתח מפה"
            >
              <MapPin className="h-4 w-4" />
              <span>פתח מפה</span>
            </button>
          </div>

          <div className="detail-row">
            <div className="detail-icon">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="detail-content">
              <span className="detail-label">תיאור המקרה</span>
              <p className="detail-value">{call.description}</p>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <Clock className="h-4 w-4" />
              <div>
                <span className="item-label">זמן קריאה</span>
                <span className="item-value">{new Date(call.timestamp).toLocaleString('he-IL')}</span>
              </div>
            </div>

            <div className="detail-item">
              <Users className="h-4 w-4" />
              <div>
                <span className="item-label">מתנדבים בדרך</span>
                <span className="item-value volunteers-count">{goingVolunteersCount}</span>
              </div>
            </div>

            <div className="detail-item">
              <User className="h-4 w-4" />
              <div>
                <span className="item-label">הסטטוס שלי</span>
                <span className={`item-value status-pill status-${currentVolunteerStatus?.toLowerCase() || 'unknown'}`}>
                  {currentVolunteerStatus || 'לא זמין'}
                </span>
              </div>
            </div>

            {responseTime && (
              <div className="detail-item">
                <Clock className="h-4 w-4" />
                <div>
                  <span className="item-label">זמן תגובה</span>
                  <span className="item-value response-time">{responseTime}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          {/* בדיקה שהקריאה לא FINISHED */}
          {call.status !== 'Finished' && call.status !== 'finished' && call.status !== 'FINISHED' && (
            <>
              {currentVolunteerStatus === 'going' && (
                <button
                  onClick={handleArrivedClick}
                  disabled={isLoading}
                  className={`action-btn arrived-btn ${isLoading ? 'loading' : ''}`}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>{isLoading ? 'מעדכן...' : 'הגעתי לזירה'}</span>
                </button>
              )}
              
              {currentVolunteerStatus === 'arrived' && (
                <button
                  onClick={() => setShowCloseCallPage(true)}
                  className="action-btn close-btn"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>סגור קריאה</span>
                </button>
              )}
            </>
          )}

          {/* הודעה שהקריאה הסתיימה */}
          {(call.status === 'Finished' || call.status === 'finished' || call.status === 'FINISHED') && (
            <div className="finished-message">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>הקריאה הושלמה בהצלחה</span>
            </div>
          )}

          {!currentVolunteerStatus && call.status !== 'Finished' && call.status !== 'finished' && call.status !== 'FINISHED' && (
            <div className="info-message">
              <User className="h-5 w-5" />
              <span>ממתין לעדכון סטטוס</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Close Call Page Modal */}
      {showCloseCallPage && (
        <CloseCallPage 
          callId={callsId}
          volunteerId={volunteerId} 
          onSubmit={(summary) => {
            console.log('Submitted summary:', summary);
          }}
          onClose={handleCloseCallPage} 
        />
      )}
    </>
  );
};

// Demo Component
const Demo: React.FC = () => {
  const mockCall: Call = {
    id: 12345,
    address: "רחוב הרצל 45, תל אביב",
    description: "דיווח על אירוע חירום בבניין מגורים - עשן יוצא מהחלון בקומה השנייה",
    priority: "גבוה",
    timestamp: "2024-07-09T10:30:00Z",
    status: "פעיל",
    type: "חירום"
  };

  const mockVolunteerCall: VolunteerCall = {
    callsId: 12345,
    volunteerId: 67890,
    volunteerStatus: "going",
    responseTime: "2 דקות",
    call: mockCall,
    goingVolunteersCount: 3
  };

  return (
    <BackgroundLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          כרטיס קריאה פעילה
        </h1>
        <ActiveCallCard volunteerCall={mockVolunteerCall} onStatusUpdate={() => {}} />
      </div>
    </BackgroundLayout>
  );
};

export default ActiveCallCard;
