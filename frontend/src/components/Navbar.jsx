import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef();

  // AI Avatar
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || "user"}`;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-white shadow-sm px-10 py-4 flex justify-between items-center border-b border-gray-200">
        <h1
          className="text-2xl font-bold text-gray-800 cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          🔹 Shayak Dashboard
        </h1>

        <div className="flex gap-10 items-center text-gray-700 font-medium">
          <button className="hover:text-blue-600 transition" onClick={() => navigate("/dashboard")}>Home</button>
          <button className="hover:text-blue-600 transition" onClick={() => navigate("/dashboard")}>File Grievance</button>
          <button className="hover:text-blue-600 transition" onClick={() => navigate("/dashboard/status")}>Status</button>
          <button className="hover:text-blue-600 transition" onClick={() => navigate("/dashboard/profile")}>Profile</button>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <img
              src={avatarUrl}
              onClick={() => setOpen(!open)}
              className="w-11 h-11 rounded-full border cursor-pointer bg-gray-50 p-1 shadow-sm hover:scale-105 transition"
              alt="profile"
            />

            {open && (
              <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl px-5 py-4 z-50 border border-gray-100">

                {/* USER INFO */}
                <div className="flex gap-3 items-center pb-3 border-b border-gray-200">
                  <img src={avatarUrl} className="w-12 h-12 rounded-full bg-gray-50 p-1 border shadow-sm" />
                  <div className="w-[140px] whitespace-nowrap overflow-hidden text-ellipsis">
                    <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* MENU */}
                <div className="flex flex-col mt-4 gap-1">
                  <button onClick={() => { navigate("/dashboard/profile"); setOpen(false); }} className="px-2 py-2 rounded-lg hover:bg-gray-100 text-left">👤 Profile</button>
                  <button onClick={() => { navigate("/dashboard/status"); setOpen(false); }} className="px-2 py-2 rounded-lg hover:bg-gray-100 text-left">📄 Grievance Status</button>
                  <button onClick={() => { navigate("/dashboard"); setOpen(false); }} className="px-2 py-2 rounded-lg hover:bg-gray-100 text-left">🏠 Home</button>

                  {/* LOGOUT BUTTON OPENS MODAL */}
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          
          <div className="bg-white p-7 rounded-xl shadow-2xl w-96 text-center animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">Confirm Logout</h2>
            <p className="text-gray-600 mt-2">Are you sure you want to logout?</p>

            <div className="flex justify-center gap-5 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  onLogout();
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default Navbar;
