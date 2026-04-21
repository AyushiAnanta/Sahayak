import React, { useEffect, useState } from "react";
import DepartmentNavbar from "../../components/DepartmentNavbar";
import { useNavigate } from "react-router-dom";
import { getDepartmentGrievances, getDepartmentById } from "../../api/department";

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-[#2a2a2f] p-6 rounded-xl border border-gray-700 shadow hover:scale-[1.02] transition">
    <p className="text-2xl mb-2">{icon}</p>
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className={`text-3xl font-bold mt-1 ${color || "text-white"}`}>{value}</h2>
  </div>
);

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dept, setDept] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) { window.location.href = "/login"; return; }
    setUser(storedUser);
    fetchAll(storedUser);
  }, []);

  const fetchAll = async (storedUser) => {
    try {
      // Fetch grievances assigned to this officer
      const gRes = await getDepartmentGrievances(storedUser.departmentId);
      const grievances = gRes?.data?.data?.grievances || [];

      const pending    = grievances.filter((g) => g.status === "pending").length;
      const inProgress = grievances.filter((g) => g.status === "in_progress").length;
      const resolved   = grievances.filter((g) => g.status === "resolved").length;

      setStats({ total: grievances.length, pending, in_progress: inProgress, resolved });

      // Fetch department info if departmentId is available
      if (storedUser?.departmentId) {
        const dRes = await getDepartmentById(storedUser.departmentId);
        setDept(dRes?.data?.data);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <DepartmentNavbar
        user={user}
        onLogout={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
      />

      <div className="pt-24 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#e8d4a2]">
              {dept ? `${dept.name} Department` : "Department Dashboard"}
            </h1>
            {dept && (
              <p className="text-gray-400 text-sm mt-1">
                Head: {dept.deptHead} · {dept.district} · {dept.email}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading dashboard...</p>
        ) : (
          <>
            {/* DEPT INFO CARD */}
            {dept && (
              <div className="bg-[#2a2a2f] border border-gray-700 rounded-xl p-6 mb-8 grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Category Handled</p>
                  <p className="text-white font-medium mt-1">{dept.category_handled}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="text-white font-medium mt-1">{dept.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pincode</p>
                  <p className="text-white font-medium mt-1">{dept.pincode}</p>
                </div>
              </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Assigned"  value={stats.total}       icon="📋" />
              <StatCard title="Pending"         value={stats.pending}     icon="⏳" color="text-yellow-400" />
              <StatCard title="In Progress"     value={stats.in_progress} icon="🔄" color="text-blue-400" />
              <StatCard title="Resolved"        value={stats.resolved}    icon="✅" color="text-green-400" />
            </div>

            <button
              onClick={() => navigate("/department/complaints")}
              className="bg-[#6c584c] px-6 py-3 rounded-lg hover:opacity-90 transition shadow"
            >
              View Assigned Complaints →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
