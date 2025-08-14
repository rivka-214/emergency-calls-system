import axios from "./axios";
import type { AxiosResponse } from "axios";
import type { Call, CallResponse, CallCreateRequest, CompleteCallDto } from "../types/call.types";

const API_BASE = "https://localhost:7219/api";

// פונקציה ליצירת Headers עם Authorization
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// יצירת קריאה חדשה עם Authorization ו-Content-Type מתאים
export const createCall = async (
  callData: FormData | CallCreateRequest
): Promise<AxiosResponse<CallResponse>> => {
  try {
    console.log("🚨 Creating emergency call:", callData);

    let formData: FormData;

    if (callData instanceof FormData) {
      formData = callData;
      console.log("📋 FormData contents:");
      try {
        // @ts-ignore
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }
      } catch {
        console.log("Cannot iterate FormData entries");
      }
    } else {
      formData = new FormData();

      if (!callData.description || callData.description.trim() === "") {
        throw new Error("Description is required");
      }
      if (!callData.locationX || !callData.locationY) {
        throw new Error("Location coordinates are required");
      }
      if (!callData.urgencyLevel || callData.urgencyLevel < 1 || callData.urgencyLevel > 4) {
        throw new Error("Valid urgency level (1-4) is required");
      }

      formData.append("Description", callData.description.trim());
      formData.append("UrgencyLevel", callData.urgencyLevel.toString());
      formData.append("LocationX", callData.locationX.toString());
      formData.append("LocationY", callData.locationY.toString());
      formData.append("Status", "Open");
      formData.append("CreatedAt", new Date().toISOString());

      if (callData.fileImage) {
        formData.append("FileImage", callData.fileImage);
      }

      console.log("📋 FormData contents:");
      try {
        // @ts-ignore
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }
      } catch {
        console.log("Cannot iterate FormData entries");
      }
    }

    const response = await axios.post(`${API_BASE}/Calls`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Call created successfully:", response.data);
    return response;
  } catch (error: any) {
    console.error("❌ Failed to create call:", error.response?.data || error.message);

    if (error.response?.data?.errors) {
      console.error("📋 Validation errors:", error.response.data.errors);
      const errorMessages = Object.entries(error.response.data.errors)
        .map(
          ([field, messages]: [string, any]) =>
            `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
        )
        .join("\n");
      throw new Error(`Validation errors:\n${errorMessages}`);
    }

    throw error;
  }
};

// שיוך מתנדבים קרובים עם Authorization
export const assignNearbyVolunteers = async (callId: number): Promise<AxiosResponse<any>> => {
  try {
    console.log("👥 Assigning nearby volunteers to call:", callId);
    const response = await axios.post(`${API_BASE}/Calls/${callId}/assign-nearby`, null, {
      headers: getAuthHeaders(),
    });
    console.log("✅ Volunteers assigned successfully");
    return response;
  } catch (error: any) {
    console.error("❌ Failed to assign volunteers:", error.response?.data || error.message);
    throw error;
  }
};

// קבלת סטטוס קריאה עם Authorization
export const getCallStatus = async (
  callId: number
): Promise<AxiosResponse<{ status: string; volunteersCount?: number }>> => {
  try {
    const response = await axios.get(`${API_BASE}/Calls/status/${callId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error: any) {
    console.error("❌ Failed to get call status:", error.response?.data || error.message);
    throw error;
  }
};

// קבלת פרטי קריאה עם Authorization
export const getCallById = async (callId: number): Promise<AxiosResponse<Call>> => {
  try {
    const response = await axios.get(`${API_BASE}/Calls/${callId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error: any) {
    console.error("❌ Failed to get call details:", error.response?.data || error.message);
    throw error;
  }
};

// קבלת כל הקריאות (למנהלים) עם Authorization
export const getAllCalls = async (): Promise<AxiosResponse<Call[]>> => {
  try {
    const response = await axios.get(`${API_BASE}/Calls`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error: any) {
    console.error("❌ Failed to get all calls:", error.response?.data || error.message);
    throw error;
  }
};

// הצעות עזרה ראשונה
export const getFirstAidSuggestions = async (description: string) => {
  if (!description || typeof description !== "string") return [];

  try {
    console.log('🩺 Sending first aid request with description:', description);
    const response = await axios.post(
      `${API_BASE}/Ask/first-aid`,
      description, // שליחת string ישירות
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ First aid response:', response.data);

    // טיפול נכון בתשובה
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.guides && Array.isArray(response.data.guides)) {
      return response.data.guides;
    } else if (response.data.instructions && Array.isArray(response.data.instructions)) {
      return response.data.instructions;
    } else if (typeof response.data === "string") {
      return [response.data];
    } else if (typeof response.data === "object") {
      // אם זה אובייקט, נמיר אותו ל-string
      return [JSON.stringify(response.data, null, 2)];
    } else {
      return [];
    }
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      console.error("❌ getFirstAidSuggestions failed:", err.response.data.message);
    } else {
      console.error("❌ getFirstAidSuggestions failed", err);
    }
    return [];
  }
};

// קבלת הקריאות שלי עם Authorization
export const getMyCalls = async (): Promise<AxiosResponse<Call[]>> => {
  try {
    const response = await axios.get(`${API_BASE}/Calls/by-user`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error: any) {
    console.error("❌ Failed to get my calls:", error.response?.data || error.message);
    throw error;
  }
};

// שליפת קריאות מוקצות למתנדב עם Authorization
export const getAssignedCalls = async (volunteerId: number, status: string) => {
  try {
    const res = await axios.get(`${API_BASE}/Volunteer/${volunteerId}/calls/by-status/${status}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.info(`No calls found for volunteerId=${volunteerId} with status=${status}.`);
      return [];
    }
    console.error("Error in getAssignedCalls:", error.response?.data || error.message);
    throw error;
  }
};

export const getnotifiedAssignedCalls = async (volunteerId: number) => {
  const res = await axios.get(`${API_BASE}/VolunteersCalls/notified/${volunteerId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// שליפת קריאות פעילות למתנדב (כולל פרטי קריאה מלאים) עם Authorization
export const getActiveVolunteerCalls = async (volunteerId: number) => {
  const res = await axios.get(`${API_BASE}/VolunteersCalls/active/${volunteerId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// שליפת הסטוריית קריאות פעילות למתנדב עם Authorization
export const getVolunteerCallHistory = async (volunteerId: number) => {
  const res = await axios.get(`${API_BASE}/VolunteersCalls/history/${volunteerId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// עדכון סטטוס מתנדב עם Authorization
export const updateVolunteerStatus = async (
  callId: number,
  volunteerId: number,
  status: string
) => {
  if (!callId || !volunteerId || !status) {
    throw new Error(
      `Missing data for updateVolunteerStatus: callId=${callId}, volunteerId=${volunteerId}, status=${status}`
    );
  }
  try {
    const res = await axios.put(
      `${API_BASE}/VolunteersCalls/${callId}/${volunteerId}/status`,
      {
        Status: status,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("❌ updateVolunteerStatus error:", error.response?.data || error.message);
    throw error;
  }
};

export const finishVolunteerCall = async (
  callId: number,
  volunteerId: number,
  data: CompleteCallDto
) => {
  if (!callId || !volunteerId || !data.summary) {
    throw new Error(`Missing data for finishVolunteerCall`);
  }

  try {
    const res = await axios.put(
      `${API_BASE}/VolunteersCalls/${callId}/${volunteerId}/complete`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("❌ finishVolunteerCall error:", error.response?.data || error.message);
    throw error;
  }
};

// שליפת מתנדבים לקריאה ספציפית עם Authorization
export const getVolunteersForCall = (callId: number) =>
  axios.get(`${API_BASE}/Calls/${callId}/volunteers`, {
    headers: getAuthHeaders(),
  });
