import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// ADMIN GRIEVANCES
export const getAllGrievances = () => API.get("/admin/grievances");
export const assignGrievance = (id, data) => API.put(`/admin/assign/${id}`, data);
export const updateGrievanceStatus = (id, data) => API.put(`/admin/status/${id}`, data);

// ADMIN STATS
export const getMonthlyStats = () => API.get("/admin/stats/monthly");
export const getUserStats = () => API.get("/admin/stats/users"); // ✅ new

// ADMIN NOTIFICATIONS
export const getAdminNotifications = () => API.get("/admin/notifications");

// DEPARTMENTS
export const getDepartments = () => API.get("/department/all");
