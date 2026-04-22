import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true, // ✅ REQUIRED for cookies
});

// ❌ REMOVE request interceptor (no token needed)

// ✅ Response interceptor stays (slightly improved)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ⚠️ Avoid redirect loop during login
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message || error.message || "API Error";

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;