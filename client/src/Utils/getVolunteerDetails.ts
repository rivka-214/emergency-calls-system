// 🔧 יצירת utility function לקבלת פרטי מתנדב
export const getVolunteerDetails = (): number | null => {
  // בדיקה ב-localStorage קודם
  const storedId = localStorage.getItem("volunteerId")
  if (storedId && !isNaN(Number(storedId))) {
    return Number(storedId)
  }

  // חילוץ מ-JWT
  try {
    const token = localStorage.getItem("token")
    if (!token) return null

    const payload = JSON.parse(atob(token.split(".")[1]))

    // בדיקת שדות אפשריים ב-JWT
    const possibleFields = [
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      "nameid",
      "volunteerId",
      "id",
      "sub",
    ]

    for (const field of possibleFields) {
      if (payload[field] && !isNaN(Number(payload[field]))) {
        const id = Number(payload[field])
        localStorage.setItem("volunteerId", id.toString())
        return id
      }
    }
  } catch (error) {
    console.error("❌ Error extracting volunteer ID from token:", error)
  }

  return null
}
