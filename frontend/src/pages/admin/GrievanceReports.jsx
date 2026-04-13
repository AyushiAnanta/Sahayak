import React, { useState, useEffect } from "react";

// ─── Mock API helpers (replace with your real api/ calls) ───────────────────
const fetchGrievances = async () => [
  { id: "GRV-001", title: "Road not repaired after rain", category: "Infrastructure", district: "Delhi",     status: "pending",     priority: "high",   submittedBy: "Riya Sharma",  date: "2026-03-10", assignedTo: "" },
  { id: "GRV-002", title: "Water supply disrupted",       category: "Utilities",      district: "Mumbai",    status: "in_progress", priority: "high",   submittedBy: "Arjun Mehta", date: "2026-03-14", assignedTo: "Water Dept" },
  { id: "GRV-003", title: "Streetlights not working",     category: "Infrastructure", district: "Pune",      status: "resolved",    priority: "medium", submittedBy: "Priya Nair",  date: "2026-03-18", assignedTo: "PWD" },
  { id: "GRV-004", title: "Garbage not collected",        category: "Sanitation",     district: "Delhi",     status: "pending",     priority: "medium", submittedBy: "Suresh Kumar",date: "2026-03-22", assignedTo: "" },
  { id: "GRV-005", title: "Pothole near school zone",     category: "Infrastructure", district: "Chennai",   status: "in_progress", priority: "high",   submittedBy: "Ananya Reddy",date: "2026-04-01", assignedTo: "PWD" },
  { id: "GRV-006", title: "Park lights not functioning",  category: "Utilities",      district: "Hyderabad", status: "resolved",    priority: "low",    submittedBy: "Riya Sharma", date: "2026-04-05", assignedTo: "Electricity Dept" },
];
const updateGrievanceStatus = async (id, status) => ({ success: true });
const assignGrievanceDept   = async (id, dept)   => ({ success: true });
// ────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = ["PWD", "Water Dept", "Electricity Dept", "Sanitation Dept", "Health Dept"];

const STATUS_STYLE = {
  pending:     "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  in_progress: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  resolved:    "bg-green-500/15 text-green-400 border border-green-500/30",
};

const PRIORITY_DOT = {
  high:   "bg-red-500",
  medium: "bg-yellow-400",
  low:    "bg-green-500",
};

export default function GrievanceReports() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [selected, setSelected]     = useState(null); // detail modal
  const [assigning, setAssigning]   = useState(null); // id being assigned
  const [toast, setToast]           = useState("");

  useEffect(() => {
    fetchGrievances().then((d) => { setGrievances(d); setLoading(false); });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleStatusChange = async (id, newStatus) => {
    await updateGrievanceStatus(id, newStatus);
    setGrievances((g) => g.map((x) => x.id === id ? { ...x, status: newStatus } : x));
    if (selected?.id === id) setSelected((s) => ({ ...s, status: newStatus }));
    showToast("Status updated.");
  };

  const handleAssign = async (id, dept) => {
    setAssigning(id);
    await assignGrievanceDept(id, dept);
    setGrievances((g) => g.map((x) => x.id === id ? { ...x, assignedTo: dept } : x));
    if (selected?.id === id) setSelected((s) => ({ ...s, assignedTo: dept }));
    setAssigning(null);
    showToast(`Assigned to ${dept}.`);
  };

  const filtered = grievances.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
                        g.district.toLowerCase().includes(search.toLowerCase()) ||
                        g.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = {
    total:       grievances.length,
    pending:     grievances.filter((g) => g.status === "pending").length,
    in_progress: grievances.filter((g) => g.status === "in_progress").length,
    resolved:    grievances.filter((g) => g.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-[#6c584c] text-white px-5 py-3 rounded-lg shadow-lg z-50 text-sm">
          {toast}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2f] rounded-2xl w-full max-w-lg p-7 border border-white/10">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs text-gray-500 mb-1">{selected.id}</p>
                <h2 className="text-lg font-bold">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              {[
                ["Category",   selected.category],
                ["District",   selected.district],
                ["Submitted",  selected.date],
                ["By",         selected.submittedBy],
                ["Priority",   selected.priority],
                ["Assigned To",selected.assignedTo || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-gray-500 text-xs mb-0.5">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>

            {/* Change status */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {["pending", "in_progress", "resolved"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selected.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${selected.status === s ? STATUS_STYLE[s] : "border-white/10 text-gray-400 hover:border-white/30"}`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign dept */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Assign to Department</p>
              <select
                defaultValue={selected.assignedTo}
                onChange={(e) => handleAssign(selected.id, e.target.value)}
                disabled={assigning === selected.id}
                className="w-full bg-[#1f1f23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c584c]"
              >
                <option value="">— Select Department —</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-1">Grievance Reports</h1>
      <p className="text-gray-400 mb-8 text-sm">Track, assign, and resolve citizen complaints.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",       value: counts.total,       color: "text-[#c4a882]" },
          { label: "Pending",     value: counts.pending,     color: "text-yellow-400" },
          { label: "In Progress", value: counts.in_progress, color: "text-blue-400" },
          { label: "Resolved",    value: counts.resolved,    color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#2a2a2f] rounded-xl p-4 text-center border border-white/5">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, ID, or district…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c584c]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c584c]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#2a2a2f] rounded-xl border border-white/5 overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">Loading grievances…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">No grievances match your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 text-left">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">District</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Assigned To</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">{g.id}</td>
                  <td className="px-5 py-4 font-medium max-w-[200px] truncate">{g.title}</td>
                  <td className="px-5 py-4 text-gray-400">{g.district}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[g.priority]}`} />
                      <span className="capitalize text-gray-300">{g.priority}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[g.status]}`}>
                      {g.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{g.assignedTo || <span className="italic text-gray-600">unassigned</span>}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelected(g)}
                      className="px-3 py-1 rounded-lg bg-[#6c584c]/20 text-[#c4a882] hover:bg-[#6c584c]/40 text-xs font-medium transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
