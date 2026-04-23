import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    //  Save token
    localStorage.setItem("token", token);

    // Attach token
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");

        const userData = res?.data?.data;

        if (!userData) {
          throw new Error("User data missing");
        }

        console.log("✅ GOOGLE USER:", userData);

        login(userData, token);

        // Redirect
        if (userData.role === "department") navigate("/department");
        else if (userData.role === "officer") navigate("/officer");
        else if (userData.role === "admin") navigate("/admin");
        else navigate("/dashboard");

      } catch (err) {
        console.error(" Failed to fetch user:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  return <div className="text-center mt-10">Logging you in...</div>;
};

export default GoogleSuccess;