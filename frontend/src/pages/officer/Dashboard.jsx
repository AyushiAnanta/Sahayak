import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OfficerNavbar from "../../components/OfficerNavbar";
import { getAssignedTasks } from "../../api/officer";

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-[#2a2a2f] p-6 rounded-xl border border-gray-700 shadow hover:scale-[1.02] transition">
    <p className="text-2xl mb-2">{icon}</p>
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className={`text-3xl font-bold mt-1 ${color || "text-white"}`}>{value}</h2>
  </div>
);

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats]   = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { window.location.href = "/login"; return; }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res   = await getAssignedTasks();
      console.log("res",res)
      const tasks = res?.data?.data?.tasks || [];

      setStats({
        total:       tasks.length,
        pending:     tasks.filter((t) => t.status === "pending").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        resolved:    tasks.filter((t) => t.status === "resolved").length,
      });

      const sorted = [...tasks]
        .filter((t) => t.status !== "resolved")
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 5);

      setRecent(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_COLOR = (score) => {
    if (score >= 76) return "text-red-400";
    if (score >= 51) return "text-orange-400";
    if (score >= 26) return "text-yellow-400";
    return "text-green-400";
  };

  const STATUS_STYLE = {
    pending:     "bg-yellow-500/20 text-yellow-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    resolved:    "bg-green-500/20 text-green-400",
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <OfficerNavbar
        user={user}
        onLogout={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
      />

      <div className="pt-24 px-6 md:px-10 max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#e8d4a2]">Officer Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={() => navigate("/officer/tasks")}
            className="bg-[#6c584c] px-5 py-2 rounded-lg hover:opacity-90 text-sm"
          >
            View All Tasks →
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Assigned"  value={stats.total}       icon="📋" />
              <StatCard title="Pending"         value={stats.pending}     icon="⏳" color="text-yellow-400" />
              <StatCard title="In Progress"     value={stats.in_progress} icon="🔄" color="text-blue-400" />
              <StatCard title="Resolved"        value={stats.resolved}    icon="✅" color="text-green-400" />
            </div>

            {/* HIGH PRIORITY TASKS */}
            {recent.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-300 mb-4">
                  High Priority — Needs Attention
                </h2>
                <div className="space-y-3">
                  {recent.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => navigate("/officer/tasks")}
                      className="bg-[#2a2a2f] border border-gray-700 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-[#6c584c] transition"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {(t.summaryText || t.translatedText || t.originalText || "").slice(0, 80)}…
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {t.district} · {t.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                        <span className={`text-xs font-bold ${PRIORITY_COLOR(t.priorityScore)}`}>
                          {t.priorityScore} pts
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLE[t.status]}`}>
                          {t.status?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recent.length === 0 && stats.total > 0 && (
              <div className="text-center mt-16">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-gray-400">All caught up! No pending tasks.</p>
              </div>
            )}

            {stats.total === 0 && (
              <div className="text-center mt-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-400">No tasks assigned yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
