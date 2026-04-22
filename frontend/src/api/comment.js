import axiosInstance from "./axios";

// ADD COMMENT
export const addComment = async (grievanceId, content) => {
  return axiosInstance.post(`/comment/${grievanceId}`, { content });
};

// GET ALL COMMENTS FOR A GRIEVANCE
export const getComments = async (grievanceId) => {
  return axiosInstance.get(`/comment/${grievanceId}`);
};

// DELETE A COMMENT
export const deleteComment = async (commentId) => {
  return axiosInstance.delete(`/comment/${commentId}`);
};

// GET SINGLE COMMENT
export const getCommentById = async (commentId) => {
  return axiosInstance.get(`/comment/single/${commentId}`);
};