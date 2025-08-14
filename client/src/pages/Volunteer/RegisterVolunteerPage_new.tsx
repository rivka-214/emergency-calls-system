"use client"
import { useState, useEffect } from "react"
import type React from "react"
import {registerVolunteer} from "../../services/volunteer.service";
import { useNavigate } from "react-router-dom"
import { setSession } from "../../auth/auth.utils"
import { Paths } from "../../routes/paths"
import type { VolunteerRegisterData } from "../../types"
import { UserPlus, Heart, Mail, Lock, User, Phone, MapPin, Building } from "lucide-react"
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
    if (!/^[\u0590-\u05FFa-zA-Z\s]+$/.test(name)) return "השם יכול להכיל רק אותיות"
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
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return "הסיסמה חייבת להכיל לפחות אות אחת ומספר אחד"
    }
    return ""
  }

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "מספר טלפון הוא חובה"
    const phoneRegex = /^0\d{1,2}-?\d{7}$|^0\d{9}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "מספר טלפון לא תקין (לדוגמה: 050-1234567)"
    }
    return ""
  }

  const validateSpecialization = (specialization: string): string => {
    if (!specialization.trim()) return "תחום התמחות הוא חובה"
    if (specialization.trim().length < 2) return "תחום התמחות חייב להכיל לפחות 2 תווים"
    return ""
  }

  const validateAddress = (address: string): string => {
    if (!address.trim()) return "כתובת היא חובה"
    if (address.trim().length < 5) return "כתובת חייבת להכיל לפחות 5 תווים"
    return ""
  }

  const validateCity = (city: string): string => {
    if (!city.trim()) return "עיר היא חובה"
    if (city.trim().length < 2) return "שם העיר חייב להכיל לפחות 2 תווים"
    if (!/^[\u0590-\u05FFa-zA-Z\s'-]+$/.test(city)) return "שם העיר יכול להכיל רק אותיות"
    return ""
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "fullName":
        return validateFullName(value)
      case "Gmail":
        return validateEmail(value)
      case "password":
        return validatePassword(value)
      case "phoneNumber":
        return validatePhone(value)
      case "specialization":
        return validateSpecialization(value)
      case "address":
        return validateAddress(value)
      case "city":
        return validateCity(value)
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVolunteer(prev => ({ ...prev, [name]: value }))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const validateAllFields = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    Object.keys(volunteer).forEach(key => {
      if (key !== "role") {
        const error = validateField(key, volunteer[key as keyof VolunteerRegisterData] as string)
        if (error) newErrors[key] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAllFields()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await registerVolunteer(volunteer)
      const { token } = response.data
      setSession(token)
      alert("✅ ההרשמה הושלמה בהצלחה!")
      navigate(`/${Paths.volunteerHome}`)
    } catch (err: any) {
      if (err.response?.data?.message) {
        alert("❌ " + err.response.data.message)
      } else {
        alert("❌ שגיאה בהרשמה. נסה שוב.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
            {errors.fullName && (
              <div className="error-message">
                <User size={14} />
                {errors.fullName}
              </div>
            )}
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
            {errors.Gmail && (
              <div className="error-message">
                <Mail size={14} />
                {errors.Gmail}
              </div>
            )}
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
            {errors.password && (
              <div className="error-message">
                <Lock size={14} />
                {errors.password}
              </div>
            )}
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
            {errors.phoneNumber && (
              <div className="error-message">
                <Phone size={14} />
                {errors.phoneNumber}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">תחום התמחות</label>
            <input
              className={`form-input ${errors.specialization ? 'error' : ''}`}
              name="specialization"
              placeholder="למשל: עזרה ראשונה, הצלה"
              value={volunteer.specialization}
              onChange={handleChange}
              required
            />
            {errors.specialization && (
              <div className="error-message">
                <Heart size={14} />
                {errors.specialization}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">כתובת</label>
              <input
                className={`form-input ${errors.address ? 'error' : ''}`}
                name="address"
                placeholder="רחוב ומספר בית"
                value={volunteer.address}
                onChange={handleChange}
                required
              />
              {errors.address && (
                <div className="error-message">
                  <MapPin size={14} />
                  {errors.address}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">עיר</label>
              <input
                className={`form-input ${errors.city ? 'error' : ''}`}
                name="city"
                placeholder="שם העיר"
                value={volunteer.city}
                onChange={handleChange}
                required
              />
              {errors.city && (
                <div className="error-message">
                  <Building size={14} />
                  {errors.city}
                </div>
              )}
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
          <p>כבר יש לך חשבון? <a href="/volunteer/login" className="auth-link">התחבר כאן</a></p>
        </div>
      </div>
    </div>
  )
}
