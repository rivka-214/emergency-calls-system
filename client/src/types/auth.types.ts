// 🔧 תיקון: שינוי gmail ל-email לעקביות עם השרת
export interface UserRegisterData {
  firstName: string
  lastName: string
  phoneNumber: string
  Gmail: string // 🔧 שינוי מ-gmail ל-email
  password: string
  role: string // 🔧 שינוי מ-Role ל-role לעקביות
}

export interface VolunteerRegisterData {
  fullName: string
  Gmail: string // 🔧 שינוי מ-gmail ל-email
  password: string
  phoneNumber: string
  specialization: string
  address: string
  city: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  role: string
  id?: number
  message?: string
}
