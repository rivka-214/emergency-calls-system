// ✅ src/services/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "https://localhost:7219/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
// import axios from "axios"

// // 🔧 הגדרת Base URL - וודא שזה תואם לשרת שלך
// const API_BASE_URL =  "https://localhost:7219/api"

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000, // 30 שניות timeout
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// })

// // 🔧 Request Interceptor - הוספת טוקן לכל בקשה
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }

//     // לוג לבדיקה
//     console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
//       data: config.data,
//       params: config.params,
//     })

//     return config
//   },
//   (error) => {
//     console.error("❌ Request Error:", error)
//     return Promise.reject(error)
//   },
// )

// // 🔧 Response Interceptor - טיפול בשגיאות ורענון טוקן
// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
//     return response
//   },
//   async (error) => {
//     const originalRequest = error.config

//     console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message,
//     })

//     // טיפול ב-401 (Unauthorized)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true

//       try {
//         // ניסיון רענון טוקן
//         const refreshToken = localStorage.getItem("refreshToken")
//         if (refreshToken) {
//           const response = await axios.post(`${API_BASE_URL}/Person/refresh-token`, {
//             refreshToken,
//           })

//           const { token: newToken } = response.data
//           localStorage.setItem("token", newToken)

//           // חזרה על הבקשה המקורית עם הטוקן החדש
//           originalRequest.headers.Authorization = `Bearer ${newToken}`
//           return axiosInstance(originalRequest)
//         }
//       } catch (refreshError) {
//         console.error("❌ Token refresh failed:", refreshError)
//         // ניקוי טוקנים ומעבר לדף התחברות
//         localStorage.removeItem("token")
//         localStorage.removeItem("refreshToken")
//         localStorage.removeItem("volunteerId")
//         window.location.href = "/login"
//       }
//     }

//     // טיפול בשגיאות CORS
//     if (error.code === "ERR_NETWORK") {
//       console.error("🌐 Network Error - בדוק CORS או חיבור לשרת")
//       alert("שגיאת רשת - בדוק חיבור לאינטרנט או הגדרות השרת")
//     }

//     return Promise.reject(error)
//   },
// )

// export default axiosInstance


