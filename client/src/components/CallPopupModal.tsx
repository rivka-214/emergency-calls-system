import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCallContext } from '../contexts/CallContext';
import { respondToCall } from '../services/volunteer.service';

export default function CallPopupModal() {
  const { popupCall, setPopupCall, isLoading, setIsLoading } = useCallContext();
  const [address, setAddress] = useState<string>('');
  const [volunteerId, setVolunteerId] = useState<number | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteerId = () => {
      // נסה קודם מ-localStorage
      const storedId = localStorage.getItem('volunteerId');
      if (storedId && !isNaN(Number(storedId))) {
        setVolunteerId(Number(storedId));
        return;
      }

      // אם לא קיים, נסה לחלץ מהטוקן
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
          if (id && !isNaN(Number(id))) {
            const volunteerId = Number(id);
            localStorage.setItem('volunteerId', volunteerId.toString());
            setVolunteerId(volunteerId);
            return;
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }

      console.warn('Could not find volunteerId');
      setVolunteerId(null);
    };
    fetchVolunteerId();
  }, []);

  useEffect(() => {
    if (popupCall) {
      console.log('🎯 Popup call received:', popupCall);
      
      // איפוס שגיאת תמונה לקריאה חדשה
      setImageError(false);
      
      // חסום גלילה בגוף הדף
      document.body.style.overflow = 'hidden';
      
      reverseGeocode(popupCall.locationX, popupCall.locationY)
        .then(setAddress)
        .catch(() => setAddress('כתובת לא זמינה'));
    } else {
      // החזר גלילה בגוף הדף
      document.body.style.overflow = 'unset';
    }
    
    // ניקוי בעת יציאה מהקומפוננט
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [popupCall]);

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`
      );
      const data = await response.json();
      return data.display_name || 'כתובת לא זמינה';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'כתובת לא זמינה';
    }
  };

  const acceptCall = async () => {
    if (!popupCall || !volunteerId) {
      console.error('Missing popupCall or volunteerId');
      return;
    }

    try {
      setIsLoading(true);
      console.log('✅ Accepting call:', popupCall.id, 'for volunteer:', volunteerId);
      await respondToCall(popupCall.id, "going");
      setPopupCall(null);
      
      // מעבר לדף הקריאות הפעילות
      navigate('/volunteer/active-calls');
    } catch (error) {
      console.error('❌ Error accepting call:', error);
      alert('שגיאה בקבלת הקריאה');
    } finally {
      setIsLoading(false);
    }
  };

  const declineCall = async () => {
    if (!popupCall || !volunteerId) {
      console.error('Missing popupCall or volunteerId');
      return;
    }

    try {
      setIsLoading(true);
      console.log('❌ Declining call:', popupCall.id, 'for volunteer:', volunteerId);
      await respondToCall(popupCall.id, "cant");
      setPopupCall(null);
    } catch (error) {
      console.error('❌ Error declining call:', error);
      alert('שגיאה בדחיית הקריאה');
    } finally {
      setIsLoading(false);
    }
  };

  if (!popupCall) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          margin: '0 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '4px solid #dc2626',
          maxHeight: '90vh',
          overflowY: 'auto',
          transform: 'scale(1.05)',
          animation: 'pulse 2s infinite'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {/* כותרת חירום */}
          <div style={{
            marginBottom: '32px',
            backgroundColor: '#fecaca',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #fca5a5',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 style={{
              fontSize: '30px',
              fontWeight: '900',
              color: '#b91c1c',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              🚨 קריאת חירום דחופה 🚨
            </h2>
            <div style={{
              fontSize: '20px',
              color: '#991b1b',
              fontWeight: 'bold'
            }}>קריאה #{popupCall.id}</div>
            <div style={{
              fontSize: '16px',
              color: '#b91c1c',
              marginTop: '8px',
              fontWeight: '600'
            }}>נדרשת תגובה מיידית!</div>
          </div>

          {/* פרטי הקריאה */}
          <div style={{
            textAlign: 'right',
            marginBottom: '40px',
            backgroundColor: '#f3f4f6',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid #d1d5db'
          }}>
            <div style={{
              borderBottom: '2px solid #d1d5db',
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <strong style={{
                color: '#111827',
                fontSize: '20px',
                display: 'block',
                marginBottom: '8px'
              }}>📝 תיאור הקריאה:</strong>
              <div style={{
                color: '#1f2937',
                fontSize: '18px',
                fontWeight: '500',
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {popupCall.description || 'לא צוין תיאור'}
              </div>
            </div>
            
            <div style={{
              borderBottom: '2px solid #d1d5db',
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <strong style={{
                color: '#111827',
                fontSize: '20px',
                display: 'block',
                marginBottom: '8px'
              }}>📍 מיקום:</strong>
              <div style={{
                color: '#1f2937',
                fontSize: '18px',
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {address || `${popupCall.locationX}, ${popupCall.locationY}`}
              </div>
            </div>

            {(popupCall as any).callerName && (
              <div style={{
                borderBottom: '2px solid #d1d5db',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <strong style={{
                  color: '#111827',
                  fontSize: '20px',
                  display: 'block',
                  marginBottom: '8px'
                }}>👤 מתקשר:</strong>
                <div style={{
                  color: '#1f2937',
                  fontSize: '18px',
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  {(popupCall as any).callerName}
                </div>
              </div>
            )}

            <div>
              <strong style={{
                color: '#111827',
                fontSize: '20px',
                display: 'block',
                marginBottom: '8px'
              }}>⏰ זמן:</strong>
              <div style={{
                color: '#1f2937',
                fontSize: '18px',
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}>
                {new Date(popupCall.date).toLocaleString('he-IL')}
              </div>
            </div>

            {/* תמונה מצורפת */}
            {popupCall.imageUrl && !imageError && (
              <div style={{
                marginTop: '20px',
                borderTop: '2px solid #d1d5db',
                paddingTop: '16px'
              }}>
                <strong style={{
                  color: '#111827',
                  fontSize: '20px',
                  display: 'block',
                  marginBottom: '8px'
                }}>📸 תמונה מצורפת:</strong>
                <div style={{
                  backgroundColor: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <img 
                    src={popupCall.imageUrl.startsWith('http') ? popupCall.imageUrl : `https://localhost:7219/api/images/${popupCall.imageUrl}`}
                    alt="תמונה מצורפת לקריאה"
                    style={{
                      width: '100%',
                      maxHeight: '250px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      backgroundColor: '#f9fafb'
                    }}
                    onError={(e) => {
                      console.error('Failed to load image:', popupCall.imageUrl);
                      // נסה נתיבים חלופיים אם ה-API לא עובד
                      const currentSrc = e.currentTarget.src;
                      if (currentSrc.includes('/api/images/')) {
                        console.log('API failed, trying static file path: /Images/');
                        e.currentTarget.src = `https://localhost:7219/Images/${popupCall.imageUrl}`;
                      } else if (currentSrc.includes('/Images/')) {
                        console.log('Trying alternative: /images/ (lowercase)');
                        e.currentTarget.src = `https://localhost:7219/images/${popupCall.imageUrl}`;
                      } else {
                        console.log('All attempts failed, showing error message');
                        setImageError(true);
                      }
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully from path:', e.currentTarget.src);
                    }}
                  />
                </div>
              </div>
            )}

            {/* הודעה במקרה של בעיה בתמונה */}
            {popupCall.imageUrl && imageError && (
              <div style={{
                marginTop: '20px',
                borderTop: '2px solid #d1d5db',
                paddingTop: '16px'
              }}>
                <strong style={{
                  color: '#111827',
                  fontSize: '20px',
                  display: 'block',
                  marginBottom: '8px'
                }}>📸 תמונה מצורפת:</strong>
                <div style={{
                  backgroundColor: '#fef2f2',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #fecaca',
                  textAlign: 'center',
                  color: '#dc2626'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
                  <div style={{ fontSize: '14px' }}>לא ניתן להציג את התמונה</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
                    נתיב: {popupCall.imageUrl}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* כפתורי פעולה - רק אשור או סירוב */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <button
              onClick={acceptCall}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: isLoading ? '#9ca3af' : '#16a34a',
                color: 'white',
                padding: '24px 32px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '20px',
                border: '2px solid #15803d',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#15803d';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  מעבד...
                </div>
              ) : (
                '✅ אני יוצא לקריאה!'
              )}
            </button>
            
            <button
              onClick={declineCall}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: isLoading ? '#9ca3af' : '#dc2626',
                color: 'white',
                padding: '24px 32px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '20px',
                border: '2px solid #b91c1c',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  מעבד...
                </div>
              ) : (
                '❌ לא יכול כרגע'
              )}
            </button>
          </div>

          {/* הודעת אזהרה */}
          <div style={{
            fontSize: '16px',
            color: '#374151',
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '12px',
            border: '2px solid #fcd34d',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 'bold'
            }}>
              ⚠️ אנא בחר את התגובה המתאימה - לא ניתן לסגור ללא בחירה
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}