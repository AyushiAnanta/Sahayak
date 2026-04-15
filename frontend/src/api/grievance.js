import axiosInstance from "./axios";

//   CREATE GRIEVANCE

export const createGrievance = async (data) => {
  return axiosInstance.post("/grievance/create", data);
};

//   GET ALL USER GRIEVANCES

export const getUserGrievances = async () => {
  return axiosInstance.get("/grievance/all");
};

//   GET SINGLE GRIEVANCE
export const getGrievanceById = async (id) => {
  return axiosInstance.get(`/grievance/${id}`);
};

//   EDIT GRIEVANCE

export const editGrievance = async (id, data) => {
  return axiosInstance.put(`/grievance/${id}/edit`, data);
};

//   DELETE GRIEVANCE

export const deleteGrievance = async (id) => {
  return axiosInstance.delete(`/grievance/${id}`);
};


//   GET GRIEVANCE STATUS

export const getGrievanceStatus = async (id) => {
  return axiosInstance.get(`/grievance/${id}/status`);
};


//   FILE UPLOAD (IMAGE / PDF)

export const uploadGrievanceFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post("/grievance/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};