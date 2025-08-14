import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getMyCalls } from "../../services/calls.service";
import "../../style/MyCallsPage.css"; // תיקון הנתיב לקובץ CSS

interface Call {
  id: number;
  locationX: number;
  locationY: number;
  description?: string;
  status: string;
  date?: string;
  urgencyLevel?: number;
  summary?: string;
}

export default function MyCallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // חזור לדף הקודם
  };

  useEffect(() => {
    const fetchCalls = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("אין טוקן, יש להתחבר מחדש");
        setLoading(false);
        return;
      }

      try {
        const response = await getMyCalls();
        setCalls(response.data);
      } catch (error) {
        console.error("שגיאה בקבלת הקריאות שלי", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return (
    <div className="calls-wrapper">
      <div className="calls-container">
        <div className="header-section">
          <button 
            onClick={handleGoBack}
            className="back-button"
          >
            <ArrowRight className="back-icon" />
            חזור
          </button>
          <h2 style={{ color: 'var(--emergency-red)', textShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}>
            📋 הקריאות שלי
          </h2>
        </div>
        {loading ? (
          <p>טוען קריאות...</p>
        ) : calls.length === 0 ? (
          <p>לא נמצאו קריאות.</p>
        ) : (
          <table className="calls-table">
            <thead>
              <tr>
                <th>מס'</th>
                <th>תיאור</th>
                <th>סטטוס</th>
                <th>תאריך</th>
                <th>דחיפות</th>
                <th>מיקום</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, index) => (
                <tr key={call.id}>
                  <td>{index + 1}</td>
                  <td>{call.description || "—"}</td>
                  <td>{call.status}</td>
                  <td>{call.date?.split("T")[0] || "—"}</td>
                  <td>{call.urgencyLevel ?? "—"}</td>
                  <td>
                    {call.locationX !== 0 && call.locationY !== 0
                      ? `כתובת: קו רוחב ${call.locationX.toFixed(5)}, קו אורך ${call.locationY.toFixed(5)}`
                      : "כתובת לא זמינה"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
