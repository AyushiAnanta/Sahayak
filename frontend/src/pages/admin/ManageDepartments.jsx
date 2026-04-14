import React, { useState, useEffect, useRef } from "react";

// ─── Mock API helpers (replace with your real api/ calls) ───────────────────
const fetchDepartments = async () => [
  { id: 1, name: "PWD",              head: "Mr. Ramesh Patel",   email: "pwd@gov.in",         phone: "011-23456701", status: "online" },
  { id: 2, name: "Water Department", head: "Mrs. Kavya Iyer",    email: "water@gov.in",        phone: "011-23456702", status: "online" },
  { id: 3, name: "Electricity Dept", head: "Mr. Dinesh Gupta",   email: "electricity@gov.in",  phone: "011-23456703", status: "offline" },
  { id: 4, name: "Sanitation Dept",  head: "Ms. Lakshmi Verma",  email: "sanitation@gov.in",   phone: "011-23456704", status: "online" },
  { id: 5, name: "Health Dept",      head: "Dr. Ajay Nambiar",   email: "health@gov.in",       phone: "011-23456705", status: "offline" },
];

const fetchMessages = async (deptId) => {
  const base = [
    { id: 1, from: "admin", text: "Please prioritise GRV-001. The road is causing accidents.", time: "10:02 AM", date: "2026-04-10" },
    { id: 2, from: "dept",  text: "Noted. We will deploy a team by tomorrow.", time: "10:45 AM", date: "2026-04-10" },
    { id: 3, from: "admin", text: "Kindly share the inspection report once done.", time: "11:00 AM", date: "2026-04-10" },
  ];
  // Return different stub per dept just so demo feels dynamic
  if (deptId === 2) return [{ id: 1, from: "dept", text: "Water supply will be restored by 6 PM.", time: "09:15 AM", date: "2026-04-12" }];
  if (deptId >= 3) return [];
  return base;
};

const sendMessage = async (deptId, text) => ({ success: true, message: { id: Date.now(), from: "admin", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString() } });
// ────────────────────────────────────────────────────────────────────────────

export default function CommunicateDepartments() {
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [toast, setToast]             = useState("");
  const messagesEndRef                = useRef(null);

  useEffect(() => {
    fetchDepartments().then((d) => {
      setDepartments(d);
      setActiveDept(d[0]);
    });
  }, []);

  useEffect(() => {
    if (!activeDept) return;
    setLoadingMsgs(true);
    fetchMessages(activeDept.id).then((m) => {
      setMessages(m);
      setLoadingMsgs(false);
    });
  }, [activeDept]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeDept) return;
    setSending(true);
    const res = await sendMessage(activeDept.id, text);
    setMessages((m) => [...m, res.message]);
    setInput("");
    setSending(false);
    showToast("Message sent.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    showToast("Email copied!");
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white flex flex-col md:flex-row">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-[#6c584c] text-white px-5 py-3 rounded-lg shadow-lg z-50 text-sm">
          {toast}
        </div>
      )}

      {/* ── Sidebar: department list ─────────────────── */}
      <aside className="w-full md:w-72 bg-[#242428] border-r border-white/5 flex-shrink-0">
        <div className="p-5 border-b border-white/5">
          <h1 className="text-xl font-bold">Departments</h1>
          <p className="text-xs text-gray-500 mt-0.5">Select a dept to communicate</p>
        </div>

        <ul className="overflow-y-auto">
          {departments.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => setActiveDept(d)}
                className={`w-full text-left px-5 py-4 flex items-center gap-3 transition hover:bg-white/5 ${activeDept?.id === d.id ? "bg-white/[0.06] border-l-2 border-[#6c584c]" : "border-l-2 border-transparent"}`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#6c584c]/30 flex items-center justify-center text-sm font-bold text-[#c4a882] flex-shrink-0">
                  {d.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{d.name}</p>
                  <p className="text-xs text-gray-500 truncate">{d.head}</p>
                </div>
                {/* Online dot */}
                <span className={`ml-auto w-2 h-2 rounded-full flex-shrink-0 ${d.status === "online" ? "bg-green-500" : "bg-gray-600"}`} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Main chat area ───────────────────────────── */}
      {activeDept ? (
        <main className="flex-1 flex flex-col min-h-0">

          {/* Chat header */}
          <div className="bg-[#242428] border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6c584c]/30 flex items-center justify-center text-sm font-bold text-[#c4a882]">
                {activeDept.name[0]}
              </div>
              <div>
                <p className="font-semibold">{activeDept.name}</p>
                <p className="text-xs text-gray-500">{activeDept.head}</p>
              </div>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${activeDept.status === "online" ? "bg-green-500/15 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                {activeDept.status}
              </span>
            </div>

            {/* Contact info */}
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
              <button
                onClick={() => handleCopyEmail(activeDept.email)}
                className="flex items-center gap-1.5 hover:text-white transition"
                title="Copy email"
              >
                <span>✉</span> {activeDept.email}
              </button>
              <span>📞 {activeDept.phone}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
            {loadingMsgs ? (
              <p className="text-center text-gray-600 text-sm mt-20">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-600 text-sm mt-20">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "admin"
                      ? "bg-[#6c584c] text-white rounded-br-sm"
                      : "bg-[#2a2a2f] border border-white/8 text-gray-200 rounded-bl-sm"
                  }`}>
                    {msg.text}
                    <p className={`text-xs mt-1.5 ${msg.from === "admin" ? "text-[#c4a882]/70" : "text-gray-500"}`}>{msg.time}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-[#242428] border-t border-white/5 px-6 py-4 flex-shrink-0">
            <div className="flex gap-3">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeDept.name}…`}
                className="flex-1 bg-[#1f1f23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#6c584c] transition"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="bg-[#6c584c] hover:bg-[#7a6355] text-white px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-40 transition flex-shrink-0"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          Select a department to start communicating.
        </div>
      )}
    </div>
  );
}
