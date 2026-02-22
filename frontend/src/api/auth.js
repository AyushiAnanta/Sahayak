import axiosInstance from "./axios";


// REGISTER
export const registerUser = async ({ name, username, email, password, role }) => {
  return axiosInstance.post("/auth/register", {
    name,
    username,
    email,
    password,
    role,
  });
};


// LOGIN
export const loginUser = async ({ email, username, password }) => {
  return axiosInstance.post("/auth/login", { email, username, password });
};

// LOGOUT
export const logoutUser = async () => {
  return axiosInstance.post("/auth/logout");
};

//GET CURRENT LOGGED USER

export const getCurrentUser = () => {
  return axiosInstance.get("/auth/me"); 
};

// GOOGLE LOGIN
export const googleLogin = () => {
  window.location.href = "http://localhost:8000/api/google";
};
