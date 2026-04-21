import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getMonthlyStats, getUserStats } from "../../api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    totalUsers: 0,
    totalOfficers: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [grievanceRes, userRes] = await Promise.all([
        getMonthlyStats(),
        getUserStats(),
      ]);

      const data = grievanceRes.data.data;
      const total = data.monthly.reduce((a, b) => a + b.total, 0);
      const resolved = data.monthly.reduce((a, b) => a + b.resolved, 0);

      const statusMap = {};
      data.statusDistribution.forEach((s) => {
        statusMap[s._id] = s.count;
      });

      const userData = userRes.data.data;
      console.log(userRes)
      setStats({
        total,
        resolved,
        pending: statusMap.pending || 0,
        totalUsers: userData.totalUsers,
        totalOfficers: userData.totalOfficers,
      });
    };

    load();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const GRIEVANCE_STATS = [
    { label: "Total Grievances", value: stats.total, color: "text-[#c4a882]", icon: "📋" },
    { label: "Pending", value: stats.pending, color: "text-yellow-400", icon: "⏳" },
    { label: "Resolved", value: stats.resolved, color: "text-green-400", icon: "✅" },
  ];

  const USER_STATS = [
    { label: "Registered Citizens", value: stats.totalUsers, color: "text-blue-400", icon: "👤" },
    { label: "Officers", value: stats.totalOfficers, color: "text-purple-400", icon: "🏛️" },
  ];

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* GRIEVANCE STATS */}
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Grievances</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {GRIEVANCE_STATS.map((s) => (
          <div key={s.label} className="bg-[#2a2a2f] rounded-xl p-5">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* USER STATS */}
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Users</p>
      <div className="grid grid-cols-2 gap-4 mb-10">
        {USER_STATS.map((s) => (
          <div key={s.label} className="bg-[#2a2a2f] rounded-xl p-5">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* NAVIGATION LINKS */}
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Management</p>
      <div className="grid md:grid-cols-2 gap-5">
        <Link
          to="/admin/grievances"
          className="bg-[#2a2a2f] hover:bg-[#323238] rounded-xl p-6 transition"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold">Grievance Reports</h3>
          <p className="text-xs text-gray-500 mt-1">View, assign, and update all complaints</p>
        </Link>

        <Link
          to="/admin/notifications"
          className="bg-[#2a2a2f] hover:bg-[#323238] rounded-xl p-6 transition"
        >
          <div className="text-2xl mb-2">🔔</div>
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-xs text-gray-500 mt-1">All system notifications</p>
        </Link>
      </div>
    </div>
  );
}
