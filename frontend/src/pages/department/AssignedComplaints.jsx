import React, { useEffect, useState } from "react";
import DepartmentNavbar from "../../components/DepartmentNavbar";
import {
  getDepartmentGrievances,
  getOfficersByDepartment,
  assignToOfficer,
  updateGrievanceStatus,
} from "../../api/department";

const PRIORITY_COLOR = (score) => {
  if (score >= 76) return "text-red-400";
  if (score >= 51) return "text-orange-400";
  if (score >= 26) return "text-yellow-400";
  return "text-green-400";
};

const PRIORITY_LABEL = (score) => {
  if (score >= 76) return "Critical";
  if (score >= 51) return "High";
  if (score >= 26) return "Medium";
  return "Low";
};

const STATUS_STYLE = {
  pending:     "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  resolved:    "bg-green-500/20 text-green-400",
  rejected:    "bg-red-500/20 text-red-400",
};

const AssignedComplaints = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [data, setData]           = useState([]);
  const [officers, setOfficers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [selectedStatus, setSelectedStatus]       = useState("");

  useEffect(() => {
    fetchComplaints();
    if (user?.departmentId) fetchOfficers();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await getDepartmentGrievances(user?.departmentId);
      setData(res?.data?.data?.grievances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await getOfficersByDepartment(user.departmentId);
      setOfficers(res?.data?.data || []);
    } catch (err) {
      console.error("Officers fetch failed:", err);
    }
  };

  const openModal = (g) => {
    setSelected(g);
    setSelectedOfficerId(g.assignedOfficerId?._id || "");
    setSelectedStatus(g.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Assign officer if changed
      if (selectedOfficerId && selectedOfficerId !== (selected.assignedOfficerId?._id || "")) {
        await assignToOfficer(
          selected._id,
          selectedOfficerId,
          user.departmentId
        );
      }

      // Update status if changed
      if (selectedStatus !== selected.status) {
        await updateGrievanceStatus(selected._id, selectedStatus);
      }

      await fetchComplaints();
      setSelected(null);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = data.filter((g) => {
    const text = (g.translatedText || g.originalText || "").toLowerCase();
    const matchSearch =
      text.includes(search.toLowerCase()) ||
      (g.district || "").toLowerCase().includes(search.toLowerCase()) ||
      g._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <DepartmentNavbar
        user={user}
        onLogout={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
      />

      <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#e8d4a2]">Assigned Complaints</h1>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            placeholder="Search by complaint, ID, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#2a2a2f] border border-gray-700 p-3 rounded-lg text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#2a2a2f] border border-gray-700 px-4 py-3 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Showing {filtered.length} of {data.length} complaints
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-[#2a2a2f] rounded-xl border border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1f1f23] text-gray-400">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Complaint (English)</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Assigned Officer</th>
                  <th className="p-3 text-left">Citizen</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => (
                  <tr key={g._id} className="border-t border-gray-700 hover:bg-[#1f1f23] transition">
                    <td className="p-3 text-gray-500">{i + 1}</td>

                    <td className="p-3 font-medium max-w-xs">
                      <span title={g.translatedText || g.originalText}>
                        {(g.summaryText || g.translatedText || g.originalText || "").slice(0, 60)}…
                      </span>
                    </td>

                    <td className="p-3 text-gray-400 capitalize">{g.district}</td>
                    <td className="p-3 text-gray-400 capitalize">{g.category || "—"}</td>

                    <td className={`p-3 font-semibold ${PRIORITY_COLOR(g.priorityScore)}`}>
                      ● {PRIORITY_LABEL(g.priorityScore)} ({g.priorityScore})
                    </td>

                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${STATUS_STYLE[g.status] || STATUS_STYLE.pending}`}>
                        {g.status?.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-3 text-gray-400">
                      {g.assignedOfficerId?.name || <span className="text-gray-600 italic">unassigned</span>}
                    </td>

                    <td className="p-3 text-gray-400">{g.userId?.name || "—"}</td>

                    <td className="p-3">
                      <button
                        onClick={() => openModal(g)}
                        className="bg-[#6c584c] px-3 py-1 rounded-md text-xs hover:opacity-90"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANAGE MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#2a2a2f] p-8 rounded-xl w-full max-w-lg border border-gray-700">

            <h2 className="text-xl font-bold mb-1 text-[#e8d4a2]">Manage Complaint</h2>
            <p className="text-xs text-gray-500 mb-4">ID: {selected._id}</p>

            {/* COMPLAINT SUMMARY */}
            <div className="bg-[#1f1f23] rounded-lg p-4 mb-5 text-sm space-y-2">
              <p className="text-gray-300">
                {selected.summaryText || selected.translatedText?.slice(0, 200) || selected.originalText}
              </p>
              <p className="text-gray-500">
                📍 {selected.district} · {selected.category}
              </p>
              <p className={`font-semibold ${PRIORITY_COLOR(selected.priorityScore)}`}>
                Priority: {PRIORITY_LABEL(selected.priorityScore)} ({selected.priorityScore})
              </p>
              <p className="text-gray-500">
                Citizen: {selected.userId?.name || "—"} · {selected.userId?.email || ""}
              </p>
            </div>

            {/* ASSIGN OFFICER */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-1">Assign to Officer</label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full bg-[#1f1f23] border border-gray-600 p-2 rounded-lg text-sm"
              >
                <option value="">— Unassigned —</option>
                {officers.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} ({o.username})
                  </option>
                ))}
              </select>
              {officers.length === 0 && (
                <p className="text-xs text-yellow-500 mt-1">
                  No officers found for this department.
                </p>
              )}
            </div>

            {/* UPDATE STATUS */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 block mb-2">Update Status</label>
              <div className="flex gap-2 flex-wrap">
                {["pending", "in_progress", "resolved", "rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={`px-3 py-1 rounded-lg text-xs border transition ${
                      selectedStatus === s
                        ? "bg-[#6c584c] border-[#6c584c] text-white"
                        : "border-gray-600 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#6c584c] py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
