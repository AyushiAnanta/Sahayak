import React from "react";
import { Link } from "react-router-dom";

const STATS = [
  { label: "Total Grievances", value: "124", change: "+12 this week",  color: "text-[#c4a882]" },
  { label: "Pending",          value: "38",  change: "Needs attention", color: "text-yellow-400" },
  { label: "Resolved",         value: "76",  change: "61% resolution",  color: "text-green-400" },
  { label: "Active Users",     value: "210", change: "+5 today",        color: "text-blue-400" },
];

const QUICK_LINKS = [
  {
    to: "/admin/users",
    icon: "👤",
    title: "Manage Users",
    desc: "View, suspend, or remove citizen and department accounts.",
    cta: "Open →",
  },
  {
    to: "/admin/grievances",
    icon: "📋",
    title: "Grievance Reports",
    desc: "Track, assign, and update status on all filed complaints.",
    cta: "Open →",
  },
  {
    to: "/admin/communicate",
    icon: "💬",
    title: "Communicate",
    desc: "Send messages directly to government department heads.",
    cta: "Open →",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[#2a2a2f] rounded-xl p-5 border border-white/5">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold mb-4 text-gray-300">Quick Access</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="bg-[#2a2a2f] hover:bg-[#323238] border border-white/5 hover:border-[#6c584c]/40 rounded-2xl p-6 flex flex-col gap-3 transition group"
          >
            <span className="text-3xl">{q.icon}</span>
            <div>
              <h3 className="font-semibold text-base">{q.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{q.desc}</p>
            </div>
            <span className="text-[#c4a882] text-sm font-medium group-hover:underline mt-auto">{q.cta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
