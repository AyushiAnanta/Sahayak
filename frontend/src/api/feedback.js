import axiosInstance from "./axios";

// SUBMIT FEEDBACK
export const submitFeedback = async (grievanceId, data) => {
  return axiosInstance.post(`/feedback/${grievanceId}`, data);
};

// GET FEEDBACK FOR A GRIEVANCE
export const getFeedback = async (grievanceId) => {
  return axiosInstance.get(`/feedback/${grievanceId}`);
};