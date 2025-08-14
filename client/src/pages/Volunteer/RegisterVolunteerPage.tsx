import { useState, useEffect } from "react"
import type React from "react"
import {registerVolunteer} from "../../services/volunteer.service";
import { checkVolunteerExists } from "../../services/auth.service";
import { useNavigate } from "react-router-dom"
import { setSession } from "../../auth/auth.utils"
import { Paths } from "../../routes/paths"
import type { VolunteerRegisterData } from "../../types"
import { Heart, Mail, Lock, User, Phone, MapPin, Building } from "lucide-react"
import BackgroundLayout from "../../layouts/BackgroundLayout"
import "../../style/auth.css"

interface ValidationErrors {
  [key: string]: string
}

export default function RegisterVolunteerPage() {
  const navigate = useNavigate()

  const [volunteer, setVolunteer] = useState<VolunteerRegisterData>({
    fullName: "",
    Gmail: "",
    password: "",
    phoneNumber: "",
    specialization: "",
    address: "",
    city: "",
    role: "Volunteer",
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate(`/${Paths.volunteerHome}`);
    }
  }, []);

  const validateFullName = (name: string): string => {
    if (!name.trim()) return "שם מלא הוא חובה"
    if (name.trim().length < 4) return "השם המלא חייב להכיל לפחות 4 תווים"
    return ""
  }

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "כתובת אימייל היא חובה"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "כתובת אימייל לא תקינה"
    return ""
  }

  const validatePassword = (password: string): string => {
    if (!password.trim()) return "סיסמה היא חובה"
    if (password.length < 8) return "הסיסמה חייבת להכיל לפחות 8 תווים"
    return ""
  }

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "מספר טלפון הוא חובה"
    const phoneRegex = /^0\d{1,2}-?\d{7}$|^0\d{9}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "מספר טלפון לא תקין"
    }
    return ""
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "fullName": return validateFullName(value)
      case "Gmail": return validateEmail(value)
      case "password": return validatePassword(value)
      case "phoneNumber": return validatePhone(value)
      default: return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVolunteer(prev => ({ ...prev, [name]: value }))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // בדיקה אם המתנדב כבר קיים באמצעות הפעולה החדשה
      const existsResponse = await checkVolunteerExists(volunteer.Gmail)
      if (existsResponse.exists) {
        alert("❗ המתנדב כבר קיים במערכת. אנא התחבר או השתמש באימייל אחר.")
        setIsSubmitting(false)
        return
      }

      const response = await registerVolunteer(volunteer)
      const { token } = response.data
      setSession(token)
      alert("✅ ההרשמה הושלמה בהצלחה!")
      navigate(`/${Paths.volunteerHome}`)
    } catch (err: any) {
      console.error(err)
      if (err.response?.data?.message) {
        alert("שגיאה: " + err.response.data.message)
      } else {
        alert("❌ שגיאה בהרשמה. נסה שוב.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BackgroundLayout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <Heart size={28} />
            </div>
            <h1 className="auth-title">הרשמת מתנדב</h1>
            <p className="auth-subtitle">הצטרף לצוות המתנדבים שלנו</p>
          </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">שם מלא</label>
            <input
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              name="fullName"
              placeholder="הכנס שם מלא"
              value={volunteer.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <div className="error-message">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">כתובת אימייל</label>
            <input
              className={`form-input ${errors.Gmail ? 'error' : ''}`}
              name="Gmail"
              type="email"
              placeholder="example@gmail.com"
              value={volunteer.Gmail}
              onChange={handleChange}
              required
            />
            {errors.Gmail && <div className="error-message">{errors.Gmail}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">סיסמה</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              name="password"
              type="password"
              placeholder="הכנס סיסמה חזקה"
              value={volunteer.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">מספר טלפון</label>
            <input
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              name="phoneNumber"
              placeholder="050-1234567"
              value={volunteer.phoneNumber}
              onChange={handleChange}
              required
            />
            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">תחום התמחות</label>
            <input
              className="form-input"
              name="specialization"
              placeholder="למשל: עזרה ראשונה"
              value={volunteer.specialization}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">כתובת</label>
              <input
                className="form-input"
                name="address"
                placeholder="רחוב ומספר בית"
                value={volunteer.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">עיר</label>
              <input
                className="form-input"
                name="city"
                placeholder="שם העיר"
                value={volunteer.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="loading-spinner" />
            ) : (
              'הרשמה כמתנדב'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>כבר יש לך חשבון? <a href="/login" className="auth-link">התחבר כאן</a></p>
        </div>
      </div>
    </div>
    </BackgroundLayout>
  )
}
