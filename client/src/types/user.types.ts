export enum RoleType {
  User = "User",
  Volunteer = "Volunteer",
  Admin = "Admin",
}

export interface PersonDto {
  id: number
  name: string
  email: string // 🔧 שינוי מ-gmail ל-email
  phoneNumber: string
  address: string
  role: RoleType
}

// 🔧 הסרת כפילות - UserRegisterData כבר מוגדר ב-auth.types
