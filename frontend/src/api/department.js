import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// GET grievances assigned to this department
export const getDepartmentGrievances = (departmentId) =>
  API.get(`/department/${departmentId}/grievances`);

// GET department info
export const getDepartmentById = (id) =>
  API.get(`/department/${id}`);

// GET all officers in this department — for assign dropdown
export const getOfficersByDepartment = (deptId) =>
  API.get(`/officer/by-department/${deptId}`);

// Assign grievance to a specific officer
export const assignToOfficer = (grievanceId, officerId) =>
  API.put(`/admin/assign/${grievanceId}`, { officerId });

// Update grievance status
export const updateGrievanceStatus = (grievanceId, status) =>
  API.put(`/admin/status/${grievanceId}`, { status });