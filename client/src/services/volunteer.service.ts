import axios from "./axios"
import type { AxiosResponse } from "axios"
import type { Call, Volunteer } from "../types"
import { AxiosHeaders } from "axios";

// 🔧 פונקציה מאוחדת לקבלת volunteer ID
const getVolunteerIdFromStorage = (): number | null => {
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

// 🔧 קבלת קריאות קרובות
export const getNearbyCalls = async (): Promise<AxiosResponse<Call[]>> => {
  try {
    const volunteerId = getVolunteerIdFromStorage()
    if (!volunteerId) {
      throw new Error("Volunteer ID not found - please login again")
    }

    console.log("📍 Getting nearby calls for volunteer:", volunteerId)

    const response = await axios.get("/Volunteer/nearby-alerts", {
      params: { id: volunteerId },
    })

    console.log("✅ Found nearby calls:", response.data.length)
    return response
  } catch (error: any) {
    console.error("❌ Failed to get nearby calls:", error.response?.data || error.message)
    throw error
  }
}

// 🔧 תגובה לקריאה
export const respondToCall = async (callId: number, response: "going" | "cant"): Promise<AxiosResponse<any>> => {
  try {
    const volunteerId = getVolunteerIdFromStorage();
    if (!volunteerId) {
      throw new Error("Volunteer ID not found - please login again");
    }

    console.log("🚑 Volunteer responding to call:", { callId, volunteerId, response });

    const apiResponse = await axios.put(`/VolunteersCalls/${callId}/${volunteerId}/status`, {
      status: response,
    });
    console.log("✅ Response sent successfully");
    return apiResponse;
  } catch (error: any) {
    console.error("❌ Failed to respond to call:", error.response?.data || error.message);
    throw error;
  }
}

// 🔧 עדכון סטטוס מתנדב
export const updateVolunteerStatus = async (
  callId: number,
  status: "going" | "arrived" | "finished",
): Promise<AxiosResponse<any>> => {
  try {
    const volunteerId = getVolunteerIdFromStorage()
    if (!volunteerId) {
      throw new Error("Volunteer ID not found - please login again")
    }

    console.log("📝 Updating volunteer status:", { callId, volunteerId, status })

    // 🔧 התאמה לשרת C# - שמות שדות עם אות גדולה
    const serverData: any = {
      Status: status, // S גדולה
    }

    const response = await axios.put(`/VolunteersCalls/${callId}/${volunteerId}/status`, serverData)
    console.log("✅ Status updated successfully")
    return response
  } catch (error: any) {
    console.error("❌ Failed to update status:", error.response?.data || error.message)
    throw error
  }
}

// 🔧 קבלת היסטוריית קריאות


// 🔧 קבלת קריאות פעילות
export const getActiveCalls = async (): Promise<AxiosResponse<Call[]>> => {
  try {
    const volunteerId = getVolunteerIdFromStorage()
    if (!volunteerId) {
      throw new Error("Volunteer ID not found - please login again")
    }

    console.log("🔄 Getting active calls for volunteer:", volunteerId)

    // נסה קודם עם ה-endpoint הספציפי למתנדב
    let response;
    try {
      response = await axios.get(`/VolunteersCalls/active/${volunteerId}`)
      console.log("✅ Active calls response:", response.data)
    } catch (error: any) {
      console.warn("⚠️ Specific endpoint failed, trying general endpoint:", error.response?.status)
      
      // אם זה לא עובד, נסה endpoint כללי
      try {
        response = await axios.get('/VolunteersCalls/active')
        console.log("✅ General active calls response:", response.data)
      } catch (generalError: any) {
        console.warn("⚠️ General endpoint also failed, trying calls endpoint:", generalError.response?.status)
        
        // אם גם זה לא עובד, נסה endpoint של calls כללי
        response = await axios.get('/calls/active')
        console.log("✅ Calls endpoint response:", response.data)
      }
    }

    // אם התגובה ריקה, החזר מערך ריק במקום שגיאה
    if (!response.data || response.data.length === 0) {
      console.log("📭 No active calls found")
      return { ...response, data: [] }
    }

    return response
  } catch (error: any) {
    console.error("❌ Failed to get active calls:", error.response?.data || error.message)
    
    // אם זה שגיאת 404, החזר מערך ריק במקום לזרוק שגיאה
    if (error.response?.status === 404) {
      console.log("📭 No active calls found (404)")
      return { 
        data: [], 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: { headers: {} }
      } as any
    }
    
    throw error
  }
}

// 🔧 קבלת קריאות לפי סטטוס
export const getCallsByStatus = async (status: string): Promise<AxiosResponse<Call[]>> => {
  let volunteerId: number | null = null; // Define volunteerId outside the try block

  try {
    volunteerId = getVolunteerIdFromStorage();
    if (!volunteerId) {
      throw new Error("Volunteer ID not found - please login again");
    }

    console.log("📋 Getting calls by status:", { volunteerId, status });

    const response = await axios.get(`/Volunteer/${volunteerId}/calls/by-status/${status}`);
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.info(`No calls found for volunteerId=${volunteerId} with status=${status}`);
      return {
        data: [],
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as AxiosResponse<Call[]>;
    }
    console.error("❌ Failed to get calls by status:", error.response?.data || error.message)
    throw error
  }
}// ...existing code...

// 🔧 קבלת היסטוריית קריאות של מתנדב
export const getVolunteerCallsHistory = async (): Promise<any[]> => {
  try {
    const volunteerId = getVolunteerIdFromStorage();
    if (!volunteerId) {
      throw new Error("Volunteer ID not found - please login again");
    }

    console.log("📜 Getting call history for volunteer:", volunteerId);

    const response = await axios.get(`/VolunteersCalls/history/${volunteerId}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to get volunteer call history:", error.response?.data || error.message);
    throw error;
  }
}

// ...existing code...

// 🔧 קבלת מידע על מתנדבים בקריאה
export const getCallVolunteersInfo = async (callId: number): Promise<AxiosResponse<any>> => {
  if (!callId || typeof callId !== "number" || isNaN(callId)) {
    throw new Error("callId לא תקין ב-getCallVolunteersInfo");
  }
  try {
    console.log("👥 Getting volunteers info for call:", callId)
    const response = await axios.get(`/VolunteersCalls/${callId}/info`)
    return response
  } catch (error: any) {
    console.error("❌ Failed to get call volunteers info:", error.response?.data || error.message)
    throw error
  }
}

// 🔧 קבלת כל המתנדבים (למנהלים)
export const getAllVolunteers = async (): Promise<AxiosResponse<Volunteer[]>> => {
  try {
    const response = await axios.get("/Volunteer")
    return response
  } catch (error: any) {
    console.error("❌ Failed to get all volunteers:", error.response?.data || error.message)
    throw error
  }
}

// 🔧 קבלת פרטי מתנדב
export const getVolunteerDetails = async (): Promise<number | null> => {
  return getVolunteerIdFromStorage()
}

// 🔧 הרשמת מתנדב
export const registerVolunteer = async (volunteer: any): Promise<AxiosResponse<any>> => {
  try {
    console.log("🚑 Registering volunteer:", { ...volunteer, password: "[HIDDEN]" })

    // 🔧 התאמה לשרת C# - שמות שדות עם אות גדולה
    const serverData = {
      FullName: volunteer.fullName,
      Gmail: volunteer.Gmail, // שינוי Email ל-Gmail
      Password: volunteer.password,
      PhoneNumber: volunteer.phoneNumber,
      Specialization: volunteer.specialization,
      Address: volunteer.address,
      City: volunteer.city,
      Role: volunteer.role,
    }

    const response = await axios.post("/Volunteer", serverData)

    // שמירת טוקן ו-volunteer ID
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken)
      }
      if (response.data.id) {
        localStorage.setItem("volunteerId", response.data.id.toString())
      }
    }

    return response;
  } catch (error: any) {
    console.error("❌ Volunteer registration failed:", error.response?.data || error.message);
    throw error;
  }
};

// 🔧 קבלת קריאות שהמתנדב התעדכן עליהן (עם טיפול בשגיאה 404)
export const getNotifiedCalls = async (volunteerId: number): Promise<Call[]> => {
  try {
    const response = await axios.get(`/VolunteersCalls/notified/${volunteerId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn("אין קריאות פעילות כרגע");
      return [];
    }
    console.error("❌ Failed to fetch notified calls:", error.response?.data || error.message);
    throw error;
  }
};