import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// ✅ Attach token automatically
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

// ✅ GET grievances by department
export const getDepartmentGrievances = async (departmentId) => {
  return API.get(`/department/${departmentId}/grievances`);
};

// ✅ UPDATE grievance status (THIS WAS MISSING 🚨)
export const updateStatus = async (grievanceId, status) => {
  return API.patch(`/grievance/${grievanceId}/status`, { status });
};