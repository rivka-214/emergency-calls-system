import type { VolunteerCall } from "./call.types"

export interface Volunteer {
  id: number
  Gmail: string // 🔧 שינוי מ-gmail ל-email
  fullName: string
  phoneNumber: string
  specialization: string
  address: string
  city: string
  locationX?: number
  locationY?: number
  volunteerCalls?: VolunteerCall[] // 🔧 הפיכה לאופציונלי
  // 🔧 הסרת password - לא צריך להיות חשוף בצד הלקוח
}

export interface VolunteerUpdateData {
  fullName: string
  phoneNumber: string
  address: string
  city: string
  Gmail: string
}
