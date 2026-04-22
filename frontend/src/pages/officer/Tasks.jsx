import React, { useEffect, useState } from "react";
import OfficerNavbar from "../../components/OfficerNavbar";
import { getAssignedTasks, markInProgress, completeTask } from "../../api/officer";

const PRIORITY_COLOR = (s) => {
  if (s >= 76) return "text-red-400";
  if (s >= 51) return "text-orange-400";
  if (s >= 26) return "text-yellow-400";
  return "text-green-400";
};
const PRIORITY_LABEL = (s) => {
  if (s >= 76) return "Critical";
  if (s >= 51) return "High";
  if (s >= 26) return "Medium";
  return "Low";
};
const STATUS_STYLE = {
  pending:     "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  resolved:    "bg-green-500/20 text-green-400",
  rejected:    "bg-red-500/20 text-red-400",
};

const OfficerTasks = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [remark, setRemark]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy]   = useState("priority"); // priority | date

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await getAssignedTasks();
      setTasks(res?.data?.data?.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInProgress = async () => {
    setSaving(true);
    try {
      await markInProgress(selected._id, remark);
      await fetchTasks();
      setSelected(null);
      setRemark("");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleMarkResolved = async () => {
    setSaving(true);
    try {
      await completeTask(selected._id, remark);
      await fetchTasks();
      setSelected(null);
      setRemark("");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const filtered = tasks
    .filter((t) => {
      const text = (t.translatedText || t.originalText || "").toLowerCase();
      const matchSearch =
        text.includes(search.toLowerCase()) ||
        (t.district || "").toLowerCase().includes(search.toLowerCase()) ||
        t._id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) =>
      sortBy === "priority"
        ? b.priorityScore - a.priorityScore
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <OfficerNavbar
        user={user}
        onLogout={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
      />

      <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#e8d4a2]">My Tasks</h1>

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
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#2a2a2f] border border-gray-700 px-4 py-3 rounded-lg text-sm"
          >
            <option value="priority">Sort: Priority</option>
            <option value="date">Sort: Newest</option>
          </select>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Showing {filtered.length} of {tasks.length} tasks
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-[#2a2a2f] rounded-xl border border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1f1f23] text-gray-400">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Complaint</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Citizen</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t._id} className="border-t border-gray-700 hover:bg-[#1f1f23] transition">
                    <td className="p-3 text-gray-500">{i + 1}</td>
                    <td className="p-3 font-medium max-w-xs">
                      <span title={t.translatedText || t.originalText}>
                        {(t.summaryText || t.translatedText || t.originalText || "").slice(0, 60)}…
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 capitalize">{t.district}</td>
                    <td className="p-3 text-gray-400 capitalize">{t.category || "—"}</td>
                    <td className={`p-3 font-semibold ${PRIORITY_COLOR(t.priorityScore)}`}>
                      ● {PRIORITY_LABEL(t.priorityScore)} ({t.priorityScore})
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${STATUS_STYLE[t.status] || STATUS_STYLE.pending}`}>
                        {t.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">{t.userId?.name || "—"}</td>
                    <td className="p-3">
                      {t.status !== "resolved" && t.status !== "rejected" && (
                        <button
                          onClick={() => { setSelected(t); setRemark(""); }}
                          className="bg-[#6c584c] px-3 py-1 rounded-md text-xs hover:opacity-90"
                        >
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">No tasks found.</td>
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
            <h2 className="text-xl font-bold mb-1 text-[#e8d4a2]">Update Task</h2>
            <p className="text-xs text-gray-500 mb-4">ID: {selected._id}</p>

            {/* DETAILS */}
            <div className="bg-[#1f1f23] rounded-lg p-4 mb-5 text-sm space-y-2">
              <p className="text-gray-300">
                {selected.summaryText || selected.translatedText?.slice(0, 200) || selected.originalText}
              </p>
              <p className="text-gray-500">📍 {selected.district} · {selected.category}</p>
              <p className={`font-semibold ${PRIORITY_COLOR(selected.priorityScore)}`}>
                Priority: {PRIORITY_LABEL(selected.priorityScore)} ({selected.priorityScore})
              </p>
              <p className="text-gray-500">
                Citizen: {selected.userId?.name || "—"} · {selected.userId?.email || ""}
              </p>
              <p className="text-gray-500">
                Phone: {selected.userId?.phoneNo || "—"}
              </p>
            </div>

            {/* CURRENT STATUS */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Current Status</p>
              <span className={`px-3 py-1 rounded-full text-xs ${STATUS_STYLE[selected.status]}`}>
                {selected.status?.replace("_", " ")}
              </span>
            </div>

            {/* REMARK */}
            <textarea
              rows={3}
              placeholder="Add a remark or update note..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-[#1f1f23] border border-gray-600 p-3 rounded-lg text-sm mb-5 resize-none"
            />

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => { setSelected(null); setRemark(""); }}
                className="flex-1 bg-gray-700 py-2 rounded-lg text-sm hover:bg-gray-600"
              >
                Cancel
              </button>

              {selected.status === "pending" && (
                <button
                  onClick={handleMarkInProgress}
                  disabled={saving}
                  className="flex-1 bg-blue-600 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Mark In Progress"}
                </button>
              )}

              {(selected.status === "pending" || selected.status === "in_progress") && (
                <button
                  onClick={handleMarkResolved}
                  disabled={saving}
                  className="flex-1 bg-green-600 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Mark Resolved"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerTasks;
