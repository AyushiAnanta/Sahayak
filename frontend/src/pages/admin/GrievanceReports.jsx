import React, { useState, useEffect } from "react";
import {
  getAllGrievances,
  updateGrievanceStatus,
  assignGrievance,
  getDepartments,
} from "../../api/admin";

export default function GrievanceReports() {
  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, dRes] = await Promise.all([
          getAllGrievances(),
          getDepartments(),
        ]);

        const formatted = gRes.data.data.grievances.map((g) => ({
          id: g._id,
          title: g.originalText?.slice(0, 60),
          district: g.district,
          status: g.status,
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

  // ─────────────────────────────────────────
  // FILTER LOGIC
  // ─────────────────────────────────────────
  const filtered = grievances.filter((g) => {
    const matchesSearch =
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.user.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    await updateGrievanceStatus(id, { status });

    setGrievances((g) =>
      g.map((x) => (x.id === id ? { ...x, status } : x))
    );
  };

  const handleAssign = async (id, deptId) => {
    await assignGrievance(id, { departmentId: deptId });

    const deptName = departments.find((d) => d._id === deptId)?.name;

    setGrievances((g) =>
      g.map((x) =>
        x.id === id ? { ...x, assignedTo: deptName } : x
      )
    );
  };

  if (loading)
    return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">
        Grievance Reports
      </h1>

      {/* ───────── FILTER BAR ───────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by ID or User..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none"
        />

        {/* Status filter */}
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
      </div>

      {/* ───────── TABLE ───────── */}
      <div className="bg-[#2a2a2f] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Assign</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-white/5">
                <td className="p-4 text-xs text-gray-400">{g.id}</td>

                <td className="p-4">{g.user}</td>

                <td className="p-4">{g.title}</td>

                <td className="p-4">
                  <select
                    value={g.status}
                    onChange={(e) =>
                      handleStatusChange(g.id, e.target.value)
                    }
                    className="bg-[#1f1f23] border border-white/10 px-2 py-1 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                <td className="p-4">
                  <select
                    onChange={(e) =>
                      handleAssign(g.id, e.target.value)
                    }
                    className="bg-[#1f1f23] border border-white/10 px-2 py-1 rounded"
                  >
                    <option>Select</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No grievances found.
          </div>
        )}
      </div>
    </div>
  );
}