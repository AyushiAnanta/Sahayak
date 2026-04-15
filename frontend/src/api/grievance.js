import axiosInstance from "./axios";

// ➕ CREATE GRIEVANCE
export const createGrievance = (data) =>
  axiosInstance.post("/grievance/create", data);

// GET ALL USER GRIEVANCES
export const getUserGrievances = () =>
  axiosInstance.get("/grievance/all");

// GET SINGLE GRIEVANCE
export const getGrievanceById = (id) =>
  axiosInstance.get(`/grievance/${id}`);

// EDIT GRIEVANCE
export const editGrievance = (id, data) =>
  axiosInstance.put(`/grievance/${id}/edit`, data);

// DELETE GRIEVANCE
export const deleteGrievance = (id) =>
  axiosInstance.delete(`/grievance/${id}`);

// GET STATUS
export const getGrievanceStatus = (id) =>
  axiosInstance.get(`/grievance/${id}/status`);

// UPLOAD FILE (MULTER)
export const uploadGrievanceFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post("/grievance/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
