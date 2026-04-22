import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// GET all tasks assigned to this officer
export const getAssignedTasks = () =>
  API.get("/officer/tasks");

// Mark task as in_progress
export const markInProgress = (id, remark = "") =>
  API.put(`/officer/tasks/${id}/progress`, { remark });

// Mark task as resolved
export const completeTask = (id, remark = "") =>
  API.put(`/officer/tasks/${id}/complete`, { remark });

// GET department info (for profile page)
export const getDepartmentById = (id) =>
  API.get(`/department/${id}`);