import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveCallCard from '../../components/ActiveCallCard';
import BackgroundLayout from '../../layouts/BackgroundLayout';
import LoadingContainer from "../../components/LoadingContainer";
import ErrorContainer from '../../components/ErrorContainer';
import { getActiveCalls } from '../../services/volunteer.service';
import type { VolunteerCall } from '../../types/volunteerCall.types';
import '../../layouts/VolunteerActiveCallsPage.css';

// נתוני דמה לבדיקה
const mockActiveCalls: VolunteerCall[] = [
  {
    callsId: 1,
    volunteerId: 1,
    volunteerStatus: 'going',
    responseTime: new Date().toISOString(),
    call: {
      id: 1,
      locationX: 31.7683,
      locationY: 35.2137,
      arrImage: undefined,
      date: new Date().toISOString(),
      fileImage: undefined,
      description: 'אירוע רפואי דחוף - אדם מתעלף ברחוב',
      urgencyLevel: 4,
      status: 'Open',
      summary: '',
      sentToHospital: false,
      hospitalName: '',
      userId: 1,
      address: 'רחוב הרצל 45, תל אביב',
      priority: 'גבוה',
      timestamp: new Date().toISOString(),
      type: 'רפואי',
    },
    goingVolunteersCount: 2,
  },
  {
    callsId: 2,
    volunteerId: 2,
    volunteerStatus: 'pending',
    responseTime: new Date().toISOString(),
    call: {
      id: 2,
      locationX: 31.7767,
      locationY: 35.2345,
      arrImage: undefined,
      date: new Date().toISOString(),
      fileImage: undefined,
      description: 'תאונת דרכים קלה - זקוק לעזרה ראשונה',
      urgencyLevel: 2,
      status: 'InProgress',
      summary: '',
      sentToHospital: false,
      hospitalName: '',
      userId: 2,
      address: 'שדרות רוטשילד 12, תל אביב',
      priority: 'בינוני',
      timestamp: new Date().toISOString(),
      type: 'תאונה',
    },
    goingVolunteersCount: 1,
  }
];

export default function VolunteerActiveCallsPage() {
  const navigate = useNavigate();
  const [activeCalls, setActiveCalls] = useState<VolunteerCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // פונקציה לקביעת דרגת חומרה לפי רמת דחיפות
  const getPriorityByUrgency = (urgencyLevel: number): string => {
    switch (urgencyLevel) {
      case 1: return 'נמוך';
      case 2: return 'בינוני';
      case 3: return 'גבוה';
      case 4: 
      case 5: return 'קריטי';
      default: return 'בינוני';
    }
  };

  const loadActiveCalls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading active calls...');
      const res = await getActiveCalls();
      console.log('📊 Raw API response:', res.data);
      
      // בדיקה אם התגובה ריקה או לא תקינה
      if (!res.data || !Array.isArray(res.data)) {
        console.warn('⚠️ Invalid API response format:', res.data);
        setActiveCalls([]);
        return;
      }

      const callsWithMappedData = res.data.map((call: any) => {
        console.log('🔍 Processing call:', call);
        console.log('🔍 Going volunteers count options:', {
          goingVolunteersCount: call.goingVolunteersCount,
          numVolunteer: call.numVolunteer,
          callNumVolunteer: call.call?.numVolunteer,
          callNumVolunteerCap: call.call?.NumVolunteer
        });
        
        // חילוץ כתובת מכל השדות האפשריים
        const address = call.call?.address || 
                       call.address || 
                       call.call?.Address || 
                       call.Address ||
                       (call.call?.locationX && call.call?.locationY ? 
                         `נ"צ: ${call.call.locationX}, ${call.call.locationY}` : 
                         'כתובת לא זמינה');
        
        console.log('📍 Address found:', address);
        
        return {
          callsId: call.callsId || call.id || Math.random() * 1000,
          volunteerId: call.volunteerId || 0,
          volunteerStatus: call.volunteerStatus || 'pending',
          responseTime: call.responseTime || new Date().toISOString(),
          call: {
            id: call.call?.id || call.id || Math.random() * 1000,
            locationX: call.call?.locationX || call.locationX || call.call?.LocationX || call.LocationX || 0,
            locationY: call.call?.locationY || call.locationY || call.call?.LocationY || call.LocationY || 0,
            arrImage: call.call?.arrImage || call.arrImage || undefined,
            date: call.call?.date || call.date || new Date().toISOString(),
            fileImage: call.call?.fileImage || call.fileImage || undefined,
            description: call.call?.description || call.description || call.call?.Description || call.Description || 'תיאור לא זמין',
            urgencyLevel: call.call?.urgencyLevel || call.urgencyLevel || call.call?.UrgencyLevel || call.UrgencyLevel || 1,
            status: call.call?.status || call.status || call.call?.Status || call.Status || 
                    (call.volunteerStatus === 'arrived' ? 'בטיפול' : 
                     call.volunteerStatus === 'going' ? 'מתנדב בדרך' : 'פתוח'),
            summary: call.call?.summary || call.summary || call.call?.Summary || call.Summary || '',
            sentToHospital: call.call?.sentToHospital || call.sentToHospital || call.call?.SentToHospital || call.SentToHospital || false,
            hospitalName: call.call?.hospitalName || call.hospitalName || call.call?.HospitalName || call.HospitalName || '',
            userId: call.call?.userId || call.userId || 0,
            address: address,
            priority: call.call?.priority || call.priority || getPriorityByUrgency(call.call?.urgencyLevel || call.urgencyLevel || 1),
            timestamp: call.call?.timestamp || call.timestamp || call.call?.createdAt || call.createdAt || new Date().toISOString(),
            type: call.call?.type || call.type || 'חירום',
          },
          goingVolunteersCount: call.goingVolunteersCount || call.numVolunteer || call.call?.numVolunteer || call.call?.NumVolunteer || 0,
        };
      });

      console.log('✅ Processed calls:', callsWithMappedData);
      setActiveCalls(callsWithMappedData);
    } catch (err: any) {
      console.error('❌ Error loading active calls:', err);
      setError(err.message || 'שגיאה בטעינת קריאות פעילות');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveCalls();
  }, []);

  const handleStatusUpdate = () => {
    loadActiveCalls();
  };

  if (isLoading) {
    return (
      <BackgroundLayout>
        <LoadingContainer message="טוען קריאות פעילות..." />
      </BackgroundLayout>
    );
  }

  if (error) {
    return (
      <BackgroundLayout>
        <ErrorContainer message={error} onRetry={loadActiveCalls} />
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout>
      <div className="active-calls-page">
        <div className="page-header">
          <div className="header-top">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              ← חזרה
            </button>
            <h1 className="page-title">🚨 קריאות פעילות</h1>
          </div>
          <p className="page-subtitle">מעקב אחר כל הקריאות הפעילות במערכת</p>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={loadActiveCalls}
              disabled={isLoading}
            >
              🔄 רענן רשימה
            </button>
            <button 
              className="debug-btn"
              onClick={() => {
                console.log('🔍 Debug Info:');
                console.log('Active Calls:', activeCalls);
                console.log('Volunteer ID:', localStorage.getItem('volunteerId'));
                console.log('Token:', localStorage.getItem('token'));
                alert(`Debug Info:\nActive Calls: ${activeCalls.length}\nVolunteer ID: ${localStorage.getItem('volunteerId')}\nToken exists: ${!!localStorage.getItem('token')}`);
              }}
            >
              🔍 דיבוג
            </button>
          </div>
        </div>

        <div className="calls-stats">
          <div className="stat-card">
            <div className="stat-number">{activeCalls.length}</div>
            <div className="stat-label">קריאות פעילות</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{activeCalls.filter(call => 
              call.volunteerStatus === 'going'
            ).length}</div>
            <div className="stat-label">מתנדבים בדרך</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{activeCalls.filter(call => call.call.urgencyLevel >= 3).length}</div>
            <div className="stat-label">דחופות</div>
          </div>
        </div>

        <div className="calls-container-modern">
          {activeCalls.length === 0 ? (
            <div className="no-calls-message-modern">
              <div className="no-calls-icon">📋</div>
              <h3>אין קריאות פעילות כרגע</h3>
              <p>כל הקריאות טופלו או שאין קריאות חדשות</p>
            </div>
          ) : (
            <div className="calls-grid-modern">
              {activeCalls.map((call) => (
                <ActiveCallCard
                  key={call.callsId}
                  volunteerCall={call}
                  onStatusUpdate={handleStatusUpdate}
                  showArrivedOnly={call.volunteerStatus === 'going'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </BackgroundLayout>
  );
}