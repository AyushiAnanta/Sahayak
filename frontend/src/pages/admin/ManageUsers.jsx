import React, { useState, useEffect } from "react";

// ─── Mock API helpers (replace with your real api/ calls) ───────────────────
const fetchUsers = async () => [
  { id: 1, name: "Riya Sharma",    email: "riya@example.com",   role: "citizen",    status: "active",   createdAt: "2025-11-01" },
  { id: 2, name: "Arjun Mehta",    email: "arjun@example.com",  role: "citizen",    status: "active",   createdAt: "2025-12-14" },
  { id: 3, name: "Priya Nair",     email: "priya@example.com",  role: "department", status: "active",   createdAt: "2026-01-03" },
  { id: 4, name: "Suresh Kumar",   email: "suresh@example.com", role: "citizen",    status: "suspended",createdAt: "2026-02-17" },
  { id: 5, name: "Ananya Reddy",   email: "ananya@example.com", role: "department", status: "active",   createdAt: "2026-03-05" },
];
const suspendUser  = async (id) => ({ success: true });
const activateUser = async (id) => ({ success: true });
const deleteUser   = async (id) => ({ success: true });
// ────────────────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  citizen:    "bg-blue-100 text-blue-700",
  department: "bg-purple-100 text-purple-700",
  admin:      "bg-yellow-100 text-yellow-800",
};

const STATUS_COLORS = {
  active:    "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-600",
};

export default function ManageUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("all");
  const [actionLoading, setAL]  = useState(null); // id of row being actioned
  const [toast, setToast]       = useState("");

  useEffect(() => {
    fetchUsers().then((data) => { setUsers(data); setLoading(false); });
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSuspend = async (id) => {
    setAL(id);
    await suspendUser(id);
    setUsers((u) => u.map((x) => x.id === id ? { ...x, status: "suspended" } : x));
    setAL(null);
    showToast("User suspended.");
  };

  const handleActivate = async (id) => {
    setAL(id);
    await activateUser(id);
    setUsers((u) => u.map((x) => x.id === id ? { ...x, status: "active" } : x));
    setAL(null);
    showToast("User activated.");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    setAL(id);
    await deleteUser(id);
    setUsers((u) => u.filter((x) => x.id !== id));
    setAL(null);
    showToast("User deleted.");
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-[#6c584c] text-white px-5 py-3 rounded-lg shadow-lg z-50 text-sm animate-pulse">
          {toast}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-1">Manage Users</h1>
      <p className="text-gray-400 mb-8 text-sm">View, suspend, or remove registered accounts.</p>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Users",  value: users.length },
          { label: "Active",       value: users.filter((u) => u.status === "active").length },
          { label: "Suspended",    value: users.filter((u) => u.status === "suspended").length },
        ].map((s) => (
          <div key={s.label} className="bg-[#2a2a2f] rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl font-bold text-[#c4a882]">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c584c]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRole(e.target.value)}
          className="bg-[#2a2a2f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c584c]"
        >
          <option value="all">All Roles</option>
          <option value="citizen">Citizen</option>
          <option value="department">Department</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#2a2a2f] rounded-xl border border-white/5 overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 text-left">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-medium">{u.name}</td>
                  <td className="px-5 py-4 text-gray-400">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[u.status] || ""}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.createdAt}</td>
                  <td className="px-5 py-4 text-right space-x-2">
                    {u.status === "active" ? (
                      <button
                        onClick={() => handleSuspend(u.id)}
                        disabled={actionLoading === u.id}
                        className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs font-medium disabled:opacity-40 transition"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(u.id)}
                        disabled={actionLoading === u.id}
                        className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium disabled:opacity-40 transition"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium disabled:opacity-40 transition"
                    >
                      Delete
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
