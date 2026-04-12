import React from "react";
import Navbar from "../../components/Navbar";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#1f1f23]">
        No user data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">

      {/* ✅ NAVBAR */}
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      {/* ✅ CONTENT */}
      <div className="pt-24 flex justify-center px-6">

        <div className="w-full max-w-xl bg-[#2a2a2f] p-8 rounded-2xl shadow-lg border border-gray-700">

          {/* TITLE */}
          <h2 className="text-3xl font-bold text-[#e8d4a2] mb-6">
            Profile
          </h2>

          {/* PROFILE CARD */}
          <div className="flex flex-col items-center text-center">

            {/* AVATAR */}
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
              alt="avatar"
              className="w-20 h-20 rounded-full bg-gray-800 p-2 border border-gray-600 mb-4"
            />

            {/* NAME */}
            <h3 className="text-xl font-semibold">
              {user.name || "N/A"}
            </h3>

            {/* EMAIL */}
            <p className="text-sm text-gray-400 truncate max-w-[200px]">
              {user.email || "N/A"}
            </p>
          </div>

          {/* DETAILS */}
          <div className="mt-8 space-y-4">

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Username</span>
              <span>{user.username || "N/A"}</span>
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Email</span>
              <span className="truncate max-w-[150px]">
                {user.email || "N/A"}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">User ID</span>
              <span className="truncate max-w-[150px]">
                {user._id || "N/A"}
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;