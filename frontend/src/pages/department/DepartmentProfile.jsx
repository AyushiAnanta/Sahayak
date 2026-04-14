// pages/department/Profile.jsx

import React, { useState } from "react";
import DepartmentNavbar from "../../components/DepartmentNavbar";

const DepartmentProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(storedUser);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    setEditMode(false);
    alert("Profile updated!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#1f1f23]">
        No user data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">

      {/* ✅ DEPARTMENT NAVBAR */}
      <DepartmentNavbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      <div className="pt-24 flex justify-center px-6">

        <div className="w-full max-w-4xl bg-[#2a2a2f] p-8 rounded-2xl shadow-lg border border-gray-700">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#e8d4a2]">
              Department Profile
            </h2>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-[#6c584c] px-5 py-2 rounded-lg"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-green-500 px-5 py-2 rounded-lg"
              >
                Save
              </button>
            )}
          </div>

          {/* AVATAR */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
              className="w-24 h-24 rounded-full bg-gray-800 p-2 border border-gray-600"
            />
            <p className="mt-3 text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="text-xs text-blue-400 mt-1 uppercase">
              {user.role}
            </p>
          </div>

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-6">

            <InputField
              label="Full Name"
              name="name"
              value={user.name}
              editMode={editMode}
              onChange={handleChange}
            />

            <InputField
              label="Username"
              name="username"
              value={user.username}
              editMode={editMode}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              name="email"
              value={user.email}
              editMode={editMode}
              onChange={handleChange}
            />

            <InputField
              label="Contact Number"
              name="contact"
              value={user.contact}
              editMode={editMode}
              onChange={handleChange}
            />

            <InputField
              label="Department ID"
              name="departmentId"
              value={user.departmentId}
              editMode={false} // 🔒 not editable
            />

            <InputField
              label="Office Location"
              name="location"
              value={user.location}
              editMode={editMode}
              onChange={handleChange}
            />

          </div>

          {/* FOOTER INFO */}
          <div className="mt-8 text-sm text-gray-500">
            Officer ID: {user._id}
          </div>

        </div>
      </div>
    </div>
  );
};

// 🔥 REUSABLE INPUT
const InputField = ({ label, name, value, editMode, onChange }) => {
  return (
    <div className="flex flex-col">

      <label className="text-sm text-gray-400 mb-1">
        {label}
      </label>

      {editMode ? (
        <input
          name={name}
          value={value || ""}
          onChange={onChange}
          className="bg-[#1f1f23] border border-gray-600 px-3 py-2 rounded-lg focus:outline-none focus:border-[#6c584c]"
        />
      ) : (
        <div className="bg-[#1f1f23] px-3 py-2 rounded-lg border border-gray-700">
          {value || "N/A"}
        </div>
      )}
    </div>
  );
};

export default DepartmentProfile;