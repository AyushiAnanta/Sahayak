import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
    localStorage.removeItem("user");

    navigate("/login");
    setTimeout(() => {
      navigate(0);   
    }, 50);

  } catch (error) {
    console.error("Logout failed:", error);
  }
};



  useEffect(() => {
    const loadUser = async () => {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const res = await getCurrentUser();
        setUser(res.data.data);
      } catch (err) {
        navigate("/login");
      }
    };
    loadUser();
  }, []);

  if (!user) return <div className="text-center mt-20 text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={handleLogout} />

      {/* PAGE CONTENT */}
      <div className="p-10">
        <Outlet user={user} />
      </div>
    </div>
  );
};

export default Dashboard;
