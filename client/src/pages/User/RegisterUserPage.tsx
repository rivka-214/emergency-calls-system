import type React from "react"
import { useState } from "react"
import { registerUser } from "../../services/auth.service"
import { useNavigate } from "react-router-dom"
import { setSession } from "../../auth/auth.utils"
import { Paths } from "../../routes/paths"
import type { UserRegisterData } from "../../types"
import { UserPlus, Mail, Lock, User, Phone } from "lucide-react"
import BackgroundLayout from "../../layouts/BackgroundLayout"
import "../../style/auth.css"

interface ValidationErrors {
  [key: string]: string
}

export default function RegisterUserPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserRegisterData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    Gmail: "", // 🔧 שינוי מ-gmail ל-email
    password: "",
    role: "User", // 🔧 שינוי מ-Role ל-role
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // פונקציות אימות
  const validateName = (name: string): string => {
    if (!name.trim()) return "שדה זה הוא חובה"
    if (name.trim().length < 2) return "השם חייב להכיל לפחות 2 תווים"
    if (!/^[\u0590-\u05FFa-zA-Z\s]+$/.test(name)) return "השם יכול להכיל רק אותיות"
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

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        return validateName(value)
      case "phoneNumber":
        return validatePhone(value)
      case "email": // 🔧 שינוי מ-gmail ל-email
        return validateEmail(value)
      case "password":
        return validatePassword(value)
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setUser({ ...user, [name]: value })

    // אימות בזמן אמת
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    newErrors.firstName = validateName(user.firstName)
    newErrors.lastName = validateName(user.lastName)
    newErrors.phoneNumber = validatePhone(user.phoneNumber)
    newErrors.email = validateEmail(user.Gmail) // 🔧 שינוי מ-gmail ל-email
    newErrors.password = validatePassword(user.password)

    setErrors(newErrors)

    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert("אנא תקן את השגיאות בטופס")
      return
    }

    setIsSubmitting(true)

    try { 

      const res = await registerUser(user)
      const { token } = res.data

      if (token) {
        setSession(token)
        alert("ההרשמה הצליחה!")
        navigate(`/${Paths.userHome}`)
      } else {
        alert("❗לא התקבל טוקן מהשרת")
      }
    } catch (err: any) {
      console.error(err)
      if (err.response?.data?.message) {
        alert("שגיאה: " + err.response.data.message)
      } else {
        alert("שגיאה בהרשמה")
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
              <UserPlus size={28} />
            </div>
            <h1 className="auth-title">הרשמת משתמש</h1>
            <p className="auth-subtitle">הצטרף למערכת החירום שלנו</p>
          </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">שם פרטי</label>
              <input
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                name="firstName"
                placeholder="הכנס שם פרטי"
                value={user.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <div className="error-message">
                  <User size={14} />
                  {errors.firstName}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">שם משפחה</label>
              <input
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                name="lastName"
                placeholder="הכנס שם משפחה"
                value={user.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <div className="error-message">
                  <User size={14} />
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">מספר טלפון</label>
            <input
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              name="phoneNumber"
              placeholder="050-1234567"
              value={user.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <div className="error-message">
                <Phone size={14} />
                {errors.phoneNumber}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">כתובת אימייל</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              name="Gmail"
              type="email"
              placeholder="example@gmail.com"
              value={user.Gmail}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="error-message">
                <Mail size={14} />
                {errors.email}
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
              value={user.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div className="error-message">
                <Lock size={14} />
                {errors.password}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="loading-spinner" />
            ) : (
              'הרשמה'
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
