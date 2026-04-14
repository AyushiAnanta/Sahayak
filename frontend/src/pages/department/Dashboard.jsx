// pages/department/Dashboard.jsx

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getDepartmentGrievances } from "../../api/department";

const DepartmentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ LOAD USER SAFELY
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    setUser(storedUser);

    if (storedUser?.departmentId) {
      fetchStats(storedUser.departmentId);
    } else {
      console.warn("No departmentId found in user");
      setLoading(false);
    }
  }, []);

  // ✅ FETCH DATA
  const fetchStats = async (departmentId) => {
    try {
      const res = await getDepartmentGrievances(departmentId);

      const data =
        res?.data?.data ||
        res?.data?.grievances ||
        res?.data ||
        [];

      const pending = data.filter((g) => g.status === "pending").length;
      const resolved = data.filter((g) => g.status === "resolved").length;

      setStats({
        total: data.length,
        pending,
        resolved,
      });

    } catch (err) {
      console.error("Error fetching grievances:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PREVENT CRASH BEFORE USER LOADS
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">

      {/* NAVBAR */}
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      {/* CONTENT */}
      <div className="pt-24 px-6 md:px-10">

        <h1 className="text-3xl font-bold mb-8 text-[#e8d4a2]">
          Department Dashboard
        </h1>

        {/* LOADING */}
        {loading ? (
          <p className="text-gray-400">Loading dashboard...</p>
        ) : (
          <>
            {/* STATS */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">

              <StatCard title="Total Complaints" value={stats.total} />

              <StatCard
                title="Pending"
                value={stats.pending}
                color="text-yellow-400"
              />

              <StatCard
                title="Resolved"
                value={stats.resolved}
                color="text-green-400"
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={() => navigate("/department/complaints")}
              className="bg-[#6c584c] px-6 py-3 rounded-lg hover:opacity-90 transition shadow"
            >
              View Assigned Complaints
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ✅ STAT CARD
const StatCard = ({ title, value, color }) => (
  <div className="bg-[#2a2a2f] p-6 rounded-xl border border-gray-700 shadow hover:scale-[1.02] transition">
    <p className="text-gray-400">{title}</p>
    <h2 className={`text-3xl font-bold mt-2 ${color || "text-white"}`}>
      {value}
    </h2>
  </div>
);

export default DepartmentDashboard;