import React, { useState } from 'react';
import { Phone, MapPin, Clock, Users, AlertCircle, CheckCircle, User } from 'lucide-react';
import { updateVolunteerStatus } from '../services/volunteer.service';
import CloseCallPage from './CloseCallForm';
import type { VolunteerCall } from '../types/volunteerCall.types';
import '../style/emergency-styles.css';
import '../style/ActiveCallCard.css';

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

  const { call, callsId, volunteerId, responseTime, goingVolunteersCount } = volunteerCall;

  // Handle arrived button click
  const handleArrivedClick = async () => {
    setIsLoading(true);
    try {
      await updateVolunteerStatus(callsId, 'arrived');
      setCurrentVolunteerStatus('arrived');
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

  // Handle open map
  const handleOpenMap = () => {
    const address = encodeURIComponent(call.address || 'כתובת לא זמינה');
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Handle open Waze
  const handleOpenWaze = () => {
    const address = encodeURIComponent(call.address || 'כתובת לא זמינה');
    const wazeUrl = `https://www.waze.com/ul?q=${address}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  // Handle share location
  const handleShareLocation = () => {
    const address = call.address || 'כתובת לא זמינה';
    const message = `🚨 קריאת חירום - ${call.description}\n📍 כתובת: ${address}\n🔗 Google Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className={`active-call-card ${call.priority?.toLowerCase() === 'גבוה' || call.priority?.toLowerCase() === 'high' ? 'urgent' : ''}`}>
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
            <div className="map-buttons">
              <button 
                className="map-btn google-maps"
                onClick={handleOpenMap}
                title="פתח במפות גוגל"
              >
                <MapPin className="h-4 w-4" />
                <span>Maps</span>
              </button>
              <button 
                className="map-btn waze"
                onClick={handleOpenWaze}
                title="פתח בWaze לניווט"
              >
                <MapPin className="h-4 w-4" />
                <span>Waze</span>
              </button>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="detail-content">
              <span className="detail-label">תיאור</span>
              <p className="detail-value">{call.description}</p>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <Users className="h-4 w-4" />
              <div>
                <span className="item-label">מתנדבים</span>
                <span className="item-value volunteers-count">{goingVolunteersCount}</span>
              </div>
            </div>

            <div className="detail-item">
              <User className="h-4 w-4" />
              <div>
                <span className="item-label">הסטטוס שלי</span>
                <span className={`item-value status-pill status-${currentVolunteerStatus?.toLowerCase() || 'unknown'}`}>
                  {currentVolunteerStatus === 'going' ? 'בדרך' : 
                   currentVolunteerStatus === 'arrived' ? 'הגעתי' :
                   currentVolunteerStatus === 'notified' ? 'התקבל' :
                   currentVolunteerStatus === 'cant' ? 'לא יכול' :
                   currentVolunteerStatus === 'finished' ? 'הסתיים' : 'לא זמין'}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <Clock className="h-4 w-4" />
              <div>
                <span className="item-label">זמן</span>
                <span className="item-value">{new Date(call.timestamp || new Date()).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
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

          {!currentVolunteerStatus && (
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

export default ActiveCallCard;
