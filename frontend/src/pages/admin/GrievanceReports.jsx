import React, { useState, useEffect } from "react";
import {
  getAllGrievances,
  updateGrievanceStatus,
  assignGrievance,
  getDepartments,
} from "../../api/admin";

const STATUS_COLORS = {
  pending: "text-yellow-400",
  in_progress: "text-blue-400",
  resolved: "text-green-400",
  rejected: "text-red-400",
};

const PRIORITY_COLOR = (score) => {
  if (score >= 76) return "text-red-400";
  if (score >= 51) return "text-orange-400";
  if (score >= 26) return "text-yellow-400";
  return "text-gray-400";
};

export default function GrievanceReports() {
  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, dRes] = await Promise.all([
          getAllGrievances(),
          getDepartments(),
        ]);

        const formatted = gRes.data.data.grievances.map((g) => ({
          id: g._id,
          // ✅ show translatedText (English) — fall back to originalText if missing
          title: (g.translatedText || g.originalText)?.slice(0, 80),
          district: g.district,
          category: g.category || "general",
          status: g.status,
          priorityScore: g.priorityScore ?? 0,
          assignedTo: g.departmentId?.name || "",
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

  // ── Unique categories for filter dropdown ──────────────────────────────────
  const categories = ["all", ...new Set(grievances.map((g) => g.category).filter(Boolean))];

  // ── Filter logic ───────────────────────────────────────────────────────────
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
      prev.map((x) => (x.id === id ? { ...x, assignedTo: deptName } : x))
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
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">District</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Assign Dept</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="p-4 text-xs text-gray-500 font-mono">
                  {g.id.slice(-8)}...
                </td>

                <td className="p-4 font-medium">{g.user}</td>

                <td className="p-4 text-gray-300 max-w-xs">
                  <span title={g.title}>{g.title}</span>
                </td>

                <td className="p-4 capitalize text-gray-400">{g.category}</td>

                <td className={`p-4 font-bold ${PRIORITY_COLOR(g.priorityScore)}`}>
                  {g.priorityScore}
                </td>

                <td className="p-4 capitalize text-gray-400">{g.district}</td>

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

                <td className="p-4">
                  <select
                    onChange={(e) => handleAssign(g.id, e.target.value)}
                    className="bg-[#1f1f23] border border-white/10 px-2 py-1 rounded text-xs"
                  >
                    <option>{g.assignedTo || "Select dept"}</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">No grievances found.</div>
        )}
      </div>
    </div>
  );
}
