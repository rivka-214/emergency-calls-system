'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
import type { CompleteCallDto } from '../types/call.types';
import { useNavigate } from 'react-router-dom';
import { finishVolunteerCall } from '../services/calls.service';
import { getVolunteerCallHistory } from '../services/calls.service';
import { X, FileText, Hospital, MapPin, Clock, AlertCircle, CheckCircle, Send, XCircle } from 'lucide-react';
import '../style/emergency-styles.css';  

interface CloseCallFormProps {
  onSubmit?: (summary: CompleteCallDto) => void; // עכשיו אופציונלי
  isLoading?: boolean;
  onCancel?: () => void;
  volunteerId: number;
  callId: number; // הוספת callId
  onClose: () => void;
}

export default function CloseCallForm({ 
  onSubmit, 
  isLoading: externalLoading = false, 
  onCancel, 
  volunteerId, 
  callId, 
  onClose 
}: CloseCallFormProps) {
  const [summary, setSummary] = useState('');
  const [sentToHospital, setSentToHospital] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const maxChars = 500;
  const navigate = useNavigate();

  // שליפת היסטוריית הקריאות כדי למצוא את הקריאה הנוכחית
  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await getVolunteerCallHistory(volunteerId).then();
        const history = response.data;
        setCallHistory(history);
        
        // מחפש את הקריאה הנוכחית
        const current = history.find((call: any) => call.callsId === callId || call.id === callId);
        if (current) {
          setCurrentCall(current);
          console.log('📋 פרטי הקריאה הנוכחית:', current);
        } else {
          console.warn('⚠️ לא נמצאה קריאה עם ID:', callId);
        }
      } catch (error) {
        console.error('❌ שגיאה בשליפת היסטוריית הקריאות:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (callId && volunteerId) {
      fetchCallHistory();
    }
  }, [callId, volunteerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (summary.trim() && summary.length >= 10) {
      const callData: CompleteCallDto = { 
        summary: summary.trim(), 
        sentToHospital, 
        hospitalName: sentToHospital ? hospitalName : undefined 
      };

      try {
        setIsLoading(true);
        
        // קריאה לשירות
        await finishVolunteerCall(callId, volunteerId, callData);
        
        // אם יש callback חיצוני - קוראים לו
        if (onSubmit) {
          onSubmit(callData);
        }
        
        // איפוס הטופס
        setSummary('');
        setCharCount(0);
        setHospitalName('');
        setSentToHospital(false);

        // סגירת המודל
        onClose();
        
        // מעבר לדף היסטוריית הקריאות
        navigate('/volunteer/history');
        
      } catch (error: any) {
        console.error('❌ שגיאה בסיום הקריאה:', error);
        alert('שגיאה בשליחת הדוח. אנא נסה שוב.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setSummary(value);
      setCharCount(value.length);
    }
  };

  const isValid = summary.trim().length >= 10 && (!sentToHospital || hospitalName.trim().length > 0);
  const finalIsLoading = isLoading || externalLoading || loadingHistory;

  // אם עדיין טוען היסטוריה
  if (loadingHistory) {
    return (
      <div className="close-call-modal">
        <div className="close-call-overlay" onClick={onClose}></div>
        <div className="close-call-container">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <h3>טוען פרטי קריאה...</h3>
            <p>אנא המתן בזמן שאנו טוענים את המידע</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="close-call-modal">
      <div className="close-call-overlay" onClick={onClose}></div>
      <div className="close-call-container">
        {/* Header */}
        <div className="close-call-header">
          <div className="header-content">
            <div className="header-icon">
              <FileText className="h-6 w-6" />
            </div>
            <div className="header-text">
              <h2>דוח סיום קריאה</h2>
              <p>מלא את הפרטים הנדרשים לסיום הטיפול</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Call Details Section */}
        {currentCall && (
          <div className="call-details-summary">
            <h3>
              <AlertCircle className="h-5 w-5" />
              פרטי הקריאה
            </h3>
            
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="stat-content">
                  <span className="stat-label">זמן טיפול</span>
                  <span className="stat-value">
                    {currentCall.call?.createdAt ? 
                      Math.round((new Date().getTime() - new Date(currentCall.call.createdAt).getTime()) / (1000 * 60)) + ' דקות' :
                      'לא זמין'
                    }
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon priority">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="stat-content">
                  <span className="stat-label">רמת דחיפות</span>
                  <span className="stat-value">{currentCall.call?.urgencyLevel || 'בינונית'}</span>
                </div>
              </div>
            </div>

            <div className="details-grid-summary">
              <div className="detail-item-summary">
                <FileText className="h-4 w-4" />
                <div>
                  <span className="detail-label-summary">תיאור</span>
                  <span className="detail-value-summary">{currentCall.call?.description || currentCall.description || 'לא זמין'}</span>
                </div>
              </div>
              <div className="detail-item-summary">
                <MapPin className="h-4 w-4" />
                <div>
                  <span className="detail-label-summary">כתובת</span>
                  <span className="detail-value-summary">{currentCall.call?.address || currentCall.address || 'לא צוין'}</span>
                </div>
              </div>
              <div className="detail-item-summary">
                <CheckCircle className="h-4 w-4" />
                <div>
                  <span className="detail-label-summary">סטטוס נוכחי</span>
                  <span className="detail-value-summary status-current">{currentCall.volunteerStatus || currentCall.status || 'לא זמין'}</span>
                </div>
              </div>
              <div className="detail-item-summary">
                <Clock className="h-4 w-4" />
                <div>
                  <span className="detail-label-summary">זמן קריאה</span>
                  <span className="detail-value-summary">{
                    currentCall.call?.createdAt ? new Date(currentCall.call.createdAt).toLocaleString('he-IL') :
                    currentCall.createdAt ? new Date(currentCall.createdAt).toLocaleString('he-IL') : 'לא זמין'
                  }</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="close-call-form">
          {/* Summary Textarea */}
          <div className="form-section">
            <label className="form-label">
              <FileText className="h-5 w-5" />
              <span>סיכום הטיפול</span>
              <span className="required">*</span>
            </label>
            <div className="textarea-container">
              <textarea
                value={summary}
                onChange={handleSummaryChange}
                placeholder="אנא פרט את הפעולות שבוצעו, המצב הסופי, והערות רלוונטיות נוספות..."
                required
                minLength={10}
                disabled={finalIsLoading}
                className="form-textarea"
              />
              <div className={`char-counter ${charCount > maxChars * 0.8 ? 'warning' : ''}`}>
                {charCount}/{maxChars}
              </div>
            </div>
            {summary.length > 0 && summary.length < 10 && (
              <div className="validation-message">
                <AlertCircle className="h-4 w-4" />
                <span>נדרשים לפחות 10 תווים לדוח</span>
              </div>
            )}
          </div>

          {/* Hospital Checkbox */}
          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={sentToHospital}
                onChange={(e) => setSentToHospital(e.target.checked)}
                disabled={finalIsLoading}
                className="form-checkbox"
              />
              <div className="checkbox-content">
                <Hospital className="h-5 w-5" />
                <span>נשלח לבית חולים</span>
              </div>
            </label>
          </div>

          {/* Hospital Name Input */}
          {sentToHospital && (
            <div className="form-section hospital-section">
              <label className="form-label">
                <Hospital className="h-5 w-5" />
                <span>שם בית החולים</span>
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="הזן שם בית החולים"
                required={sentToHospital}
                disabled={finalIsLoading}
                className="form-input"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className={`action-btn submit-btn ${finalIsLoading || !isValid ? 'disabled' : ''}`}
              disabled={finalIsLoading || !isValid}
            >
              {finalIsLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>שולח דוח...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>שלח דוח סיום</span>
                </>
              )}
            </button>
            
            {onCancel && (
              <button 
                type="button" 
                className="action-btn cancel-btn" 
                onClick={onCancel}
                disabled={finalIsLoading}
              >
                <XCircle className="h-5 w-5" />
                <span>ביטול</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}