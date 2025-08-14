"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import BackgroundLayout from "../../layouts/BackgroundLayout"
import {  getVolunteerDetails,} from "../../services/volunteer.service"
import { getActiveVolunteerCalls, updateVolunteerStatus, finishVolunteerCall } from "../../services/calls.service"
import { NOTIFICATION_CONFIG } from "../../config/notifications.config"
import { signalRService } from "../../services/signalR.service"
import { useCallContext } from "../../contexts/CallContext"
export default function VolunteerMenu() {
  const [modalCall, setModalCall] = useState<any | null>(null)
  const [openCalls, setOpenCalls] = useState<any[]>([])
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [volunteerId, setVolunteerId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { setPopupCall } = useCallContext()

  // חילוץ id מהטוקן JWT
  const extractVolunteerIdFromToken = (token: string): number | null => {
    try {
      const parts = token.split(".")
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        const possibleFields = ["volunteerId", "volunteer_id", "userId", "user_id", "id", "sub"]
        for (const field of possibleFields) {
          if (payload[field] && !isNaN(Number(payload[field]))) {
            return Number(payload[field])
          }
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בחילוץ נתונים מהטוקן:", error)
    }
    return null
  }

  // קבלת ה-id של המתנדב
  const getVolunteerId = async (): Promise<number | null> => {
    const possibilities = ["volunteerId", "volunteer_id", "userId", "user_id", "id"]
    for (const key of possibilities) {
      const value = localStorage.getItem(key)
      if (value && !isNaN(Number(value))) {
        return Number(value)
      }
    }

    const token = localStorage.getItem("token")
    if (token) {
      const idFromToken = extractVolunteerIdFromToken(token)
      if (idFromToken) {
        localStorage.setItem("volunteerId", idFromToken.toString())
        return idFromToken
      }
    }

    const idFromServer = await getVolunteerDetails()
    if (idFromServer) {
      localStorage.setItem("volunteerId", idFromServer.toString())
      return idFromServer
    }

    return null
  }

  // בדיקת טוקן תקף
  const checkAuthToken = (): boolean => {
    const token = localStorage.getItem("token")
    return !!token
  }

  // מתנדב מאשר יציאה לקריאה
  const acceptCall = async () => {
    if (!modalCall || !volunteerId) {
      alert("שגיאה: חסרים נתונים לקבלת הקריאה")
      return
    }
    if (!modalCall.id) {
      alert("שגיאה: הקריאה אינה מכילה מזהה (id)")
      return
    }
    try {
      console.log("[DEBUG] acceptCall: modalCall.id=", modalCall.id, "volunteerId=", volunteerId, "status=going")
      await updateVolunteerStatus(modalCall.id, volunteerId, "going")
      setModalCall(null)
      setAddress(null)
      navigate("/volunteer/active-calls")
    } catch (err: any) {
      if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.status === 401) {
        navigate("/login")
      } else if ((err as any).response?.data?.errors) {
        alert("שגיאה בקבלת קריאה: " + JSON.stringify((err as any).response.data.errors))
        console.error("[ERROR] acceptCall: ", (err as any).response.data.errors)
      } else {
        alert("שגיאה בקבלת קריאה")
        console.error("[ERROR] acceptCall: ", err)
      }
    }
  }

  // מתנדב מסרב לקריאה
  const declineCall = async () => {
    if (!modalCall || !volunteerId) {
      alert("שגיאה: חסרים נתונים לסירוב הקריאה")
      return
    }
    if (!modalCall.id) {
      alert("שגיאה: הקריאה אינה מכילה מזהה (id)")
      return
    }
    try {
      console.log("[DEBUG] declineCall: modalCall.id=", modalCall.id, "volunteerId=", volunteerId, "status=cant")
      await updateVolunteerStatus(modalCall.id, volunteerId, "cant")
      setModalCall(null)
      setAddress(null)
    } catch (err: any) {
      if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.status === 401) {
        navigate("/login")
      } else if ((err as any).response?.data?.errors) {
        alert("שגיאה בסירוב קריאה: " + JSON.stringify((err as any).response.data.errors))
        console.error("[ERROR] declineCall: ", (err as any).response.data.errors)
      } else {
        alert("שגיאה בסירוב קריאה")
        console.error("[ERROR] declineCall: ", err)
      }
    }
  }

  // מתנדב מעדכן שהגיע למקום
  const arrivedCall = async () => {
    if (!modalCall || !volunteerId) {
      alert("שגיאה: חסרים נתונים לעדכון הגעה")
      return
    }
    if (!modalCall.id) {
      alert("שגיאה: הקריאה אינה מכילה מזהה (id)")
      return
    }
    try {
      console.log("[DEBUG] arrivedCall: modalCall.id=", modalCall.id, "volunteerId=", volunteerId, "status=arrived")
      await updateVolunteerStatus(modalCall.id, volunteerId, "arrived")
      setModalCall(null)
      setAddress(null)
      navigate("/volunteer/active-calls")
    } catch (err: any) {
      if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.status === 401) {
        navigate("/login")
      } else if ((err as any).response?.data?.errors) {
        alert("שגיאה בעדכון הגעה: " + JSON.stringify((err as any).response.data.errors))
        console.error("[ERROR] arrivedCall: ", (err as any).response.data.errors)
      } else {
        alert("שגיאה בעדכון הגעה")
        console.error("[ERROR] arrivedCall: ", err)
      }
    }
  }

  // מתנדב מסיים טיפול
  const finishCall = async () => {
    if (!modalCall || !modalCall.id) {
      alert("שגיאה: חסרים נתונים לסיום קריאה")
      return
    }
    try {
      console.log("[DEBUG] finishCall: modalCall.id=", modalCall.id, "status=finished")
      const summary = window.prompt("נא להזין סיכום טיפול:")
      if (!summary || summary.trim() === "") {
        alert("סיכום טיפול הוא חובה לסיום קריאה!")
        return
      }
    
      setModalCall(null)
      setAddress(null)
      navigate("/volunteer/active-calls")
    } catch (err: any) {
      if (typeof err === "object" && err !== null && "response" in err && (err as any).response?.status === 401) {
        navigate("/login")
      } else if ((err as any).response?.data?.errors) {
        alert("שגיאה בסיום קריאה: " + JSON.stringify((err as any).response.data.errors))
        console.error("[ERROR] finishCall: ", (err as any).response.data.errors)
      } else {
        alert("שגיאה בסיום קריאה")
        console.error("[ERROR] finishCall: ", err)
      }
    }
  }

  // הפיכת קואורדינטות לכתובת (Reverse Geocoding)
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`,
      )
      const data = await res.json()
      return data.display_name || "כתובת לא זמינה"
    } catch (err) {
      return "כתובת לא זמינה"
    }
  }

  // אתחול: בדיקת טוקן, קבלת volunteerId, קבלת מיקום
  useEffect(() => {
    const initializeApp = async () => {
      if (!checkAuthToken()) {
        navigate("/login")
        return
      }

      const id = await getVolunteerId()
      if (!id) {
        navigate("/login")
        return
      }

      setVolunteerId(id)
      setIsLoading(false)

      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ x: pos.coords.latitude, y: pos.coords.longitude }),
        () => setCoords({ x: 32.0853, y: 34.7818 }), // תל אביב ברירת מחדל
      )

      // קריאה לשרת לקבלת כל הקריאות הפתוחות
      try {
        const response = await fetch(`/api/VolunteersCalls/active/${id}`);
        if (response.ok) {
          const calls = await response.json();
          // סינון לפי call.status
          const openCallsArr = Array.isArray(calls)
            ? calls.filter(c => c.call && c.call.status === 'OPEN')
            : (calls && calls.call && calls.call.status === 'OPEN' ? [calls] : []);
          setOpenCalls(openCallsArr);
          if (openCallsArr.length > 0) {
            setPopupCall(openCallsArr[0]); // מציג את הראשונה
          }
        }
      } catch (err) {
        console.error('שגיאה בקבלת קריאות פתוחות:', err);
      }
    }

    initializeApp()
  }, [navigate])

  // בדיקת קריאות פעילות כל 2 שניות - DISABLED להשתמש ב-SignalR
  useEffect(() => {
    // השבתת polling בגלל שימוש ב-SignalR
    console.log('🔇 VolunteerPage polling disabled - using SignalR instead');
    return;

  }, [coords, volunteerId, modalCall, isLoading])

  if (isLoading) {
    return (
      <BackgroundLayout>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>🔄 טוען...</h2>
          <p>מאתחל מערכת מתנדבים</p>
        </div>
      </BackgroundLayout>
    )
  }

  return (
    <BackgroundLayout>
      <div className="volunteer-menu-container">
        <h1 className="menu-title">תפריט מתנדב</h1>
        <div style={{ textAlign: "center", marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
          מתנדב #{volunteerId} | מיקום: {coords ? `${coords.x.toFixed(4)}, ${coords.y.toFixed(4)}` : "טוען..."}
        </div>
        <div className="menu-grid">
          <Link to="/volunteer/active-calls" className="menu-card">
            <div className="card-icon">📡</div>
            <div className="card-title">קריאות פעילות</div>
            <div className="card-subtitle">צפה בקריאות חירום פעילות</div>
          </Link>
          <Link to="/volunteer/history" className="menu-card">
            <div className="card-icon">📖</div>
            <div className="card-title">היסטוריית קריאות</div>
            <div className="card-subtitle">עיין בקריאות קודמות</div>
          </Link>
          <Link to="/volunteer/update-details" className="menu-card">
            <div className="card-icon">⚙️</div>
            <div className="card-title">עדכון פרטים אישיים</div>
            <div className="card-subtitle">עדכן את הפרטים שלך</div>
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          {/* כפתור debug לבדיקת SignalR */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={async () => {
                console.log('🔍 בדיקת SignalR...');
                const info = signalRService.getConnectionInfo();
                console.log('📊 מידע חיבור:', info);
                if (signalRService.isConnected()) {
                  await signalRService.testConnection();
                  alert('SignalR חיבור פעיל ✅');
                } else {
                  alert('SignalR לא מחובר ❌');
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔍 בדוק SignalR
            </button>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  )
}
