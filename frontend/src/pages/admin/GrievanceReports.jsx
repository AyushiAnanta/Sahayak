import React, { useState, useEffect } from "react";
import {
  getAllGrievances,
  updateGrievanceStatus,
  assignGrievance,
  getDepartments,
  getStatusHistory,
} from "../../api/admin";

const STATUS_COLORS = {
  pending: "text-yellow-400",
  in_progress: "text-blue-400",
  resolved: "text-green-400",
  rejected: "text-red-400",
};

const STATUS_BADGE = {
  pending: "bg-yellow-400/10 text-yellow-400",
  in_progress: "bg-blue-400/10 text-blue-400",
  resolved: "bg-green-400/10 text-green-400",
  rejected: "bg-red-400/10 text-red-400",
};

const PRIORITY_COLOR = (score) => {
  if (score >= 76) return "text-red-400";
  if (score >= 51) return "text-orange-400";
  if (score >= 26) return "text-yellow-400";
  return "text-gray-400";
};

// ── Status Log Modal ──────────────────────────────────────────────────────────
function StatusLogModal({ grievanceId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStatusHistory(grievanceId);
        setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [grievanceId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#2a2a2f] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <h2 className="font-semibold text-white">Status History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-3 flex-1">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No status changes recorded yet.</p>
          ) : (
            logs.map((log, i) => (
              <div key={log._id} className="relative pl-6">
                {/* Timeline dot */}
                <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#c4a882] border-2 border-[#2a2a2f]" />
                {/* Connector line */}
                {i < logs.length - 1 && (
                  <span className="absolute left-[4px] top-4 bottom-[-12px] w-px bg-white/10" />
                )}

                <div className="bg-[#1f1f23] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[log.oldStatus] || "bg-white/10 text-gray-400"}`}>
                      {log.oldStatus}
                    </span>
                    <span className="text-gray-500 text-xs">→</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[log.newStatus] || "bg-white/10 text-gray-400"}`}>
                      {log.newStatus}
                    </span>
                  </div>

                  {log.remark && (
                    <p className="text-gray-300 text-xs mt-1">{log.remark}</p>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      by{" "}
                      <span className="text-gray-300">
                        {log.changedByUserId?.name || log.changedByUserId?.username || "System"}
                      </span>
                      {log.changedByUserId?.role && (
                        <span className="ml-1 text-gray-600">({log.changedByUserId.role})</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function GrievanceReports() {
  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [logGrievanceId, setLogGrievanceId] = useState(null); 

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, dRes] = await Promise.all([
          getAllGrievances(),
          getDepartments(),
        ]);

        const formatted = gRes.data.data.grievances.map((g) => ({
          id: g._id,
          title: (g.translatedText || g.originalText)?.slice(0, 80),
          district: g.district,
          category: g.category || "general",
          subCategory: g.subCategory || "",
          status: g.status,
          priorityScore: g.priorityScore ?? 0,
          assignedTo: g.departmentId?.name || "",
          assignedDeptId: g.departmentId?._id || "",
          user: g.userId?.name || "Unknown",
        }));

        setGrievances(formatted);
        setDepartments(dRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categories = ["all", ...new Set(grievances.map((g) => g.category).filter(Boolean))];

  const filtered = grievances.filter((g) => {
    const matchesSearch =
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.user.toLowerCase().includes(search.toLowerCase()) ||
      g.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (id, status) => {
    await updateGrievanceStatus(id, { status });
    setGrievances((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status } : x))
    );
  };

  const handleAssign = async (id, deptId) => {
    await assignGrievance(id, { departmentId: deptId });
    const deptName = departments.find((d) => d._id === deptId)?.name;
    setGrievances((prev) =>
      prev.map((x) => (x.id === id ? { ...x, assignedTo: deptName, assignedDeptId: deptId } : x))
    );
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Grievance Reports</h1>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by ID, user, or complaint text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2 text-sm capitalize"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {/* SUMMARY ROW */}
      <p className="text-xs text-gray-500 mb-4">
        Showing {filtered.length} of {grievances.length} grievances
      </p>

      {/* TABLE */}
      <div className="bg-[#2a2a2f] rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Complaint (English)</th>
              <th className="p-4 text-left">AI Suggested</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">District</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Assign Dept</th>
              <th className="p-4 text-left">Logs</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition">
                {/* ID */}
                <td className="p-4 text-xs text-gray-500 font-mono">
                  {g.id.slice(-8)}...
                </td>

                {/* User */}
                <td className="p-4 font-medium">{g.user}</td>

                {/* Complaint text */}
                <td className="p-4 text-gray-300 max-w-xs">
                  <span title={g.title}>{g.title}</span>
                </td>

                {/* AI Suggested — category + subCategory from classify */}
                <td className="p-4">
                  <span className="capitalize text-[#c4a882] font-medium">{g.category}</span>
                  {g.subCategory && (
                    <span className="block text-xs text-gray-500 capitalize mt-0.5">
                      {g.subCategory}
                    </span>
                  )}
                </td>

                {/* Priority */}
                <td className={`p-4 font-bold ${PRIORITY_COLOR(g.priorityScore)}`}>
                  {g.priorityScore}
                </td>

                {/* District */}
                <td className="p-4 capitalize text-gray-400">{g.district}</td>

                {/* Status */}
                <td className="p-4">
                  <select
                    value={g.status}
                    onChange={(e) => handleStatusChange(g.id, e.target.value)}
                    className={`bg-[#1f1f23] border border-white/10 px-2 py-1 rounded text-xs ${STATUS_COLORS[g.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                {/* Assign Dept — pre-selected to current assignment */}
                <td className="p-4">
                  <select
                    value={g.assignedDeptId}
                    onChange={(e) => handleAssign(g.id, e.target.value)}
                    className="bg-[#1f1f23] border border-white/10 px-2 py-1 rounded text-xs"
                  >
                    <option value="">
                      {g.assignedTo || "Select dept"}
                    </option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </td>

                {/* Status log trigger */}
                <td className="p-4">
                  <button
                    onClick={() => setLogGrievanceId(g.id)}
                    className="text-xs text-gray-400 hover:text-white underline underline-offset-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">No grievances found.</div>
        )}
      </div>

      {/* Status Log Modal */}
      {logGrievanceId && (
        <StatusLogModal
          grievanceId={logGrievanceId}
          onClose={() => setLogGrievanceId(null)}
        />
      )}
    </div>
  );
}
