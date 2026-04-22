import React, { useEffect, useState } from "react";
import OfficerNavbar from "../../components/OfficerNavbar";
import { getDepartmentById } from "../../api/officer";

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-400 mb-1">{label}</label>
    <div className="bg-[#1f1f23] px-3 py-2 rounded-lg border border-gray-700 text-white">
      {value || "N/A"}
    </div>
  </div>
);

const OfficerProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [dept, setDept]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDept = async () => {
      if (!user?.departmentId) { setLoading(false); return; }
      try {
        const res = await getDepartmentById(user.departmentId);
        setDept(res?.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDept();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#1f1f23]">
        No user data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <OfficerNavbar
        user={user}
        onLogout={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
      />

      <div className="pt-24 px-6 max-w-4xl mx-auto space-y-6">

        {/* OFFICER CARD */}
        <div className="bg-[#2a2a2f] p-8 rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-bold text-[#e8d4a2] mb-6">Officer Profile</h2>

          <div className="flex flex-col items-center mb-8">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
              className="w-24 h-24 rounded-full bg-gray-800 p-2 border border-gray-600"
            />
            <p className="mt-3 text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            <span className="mt-2 px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
              OFFICER
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Full Name"  value={user.name} />
            <Field label="Username"   value={user.username} />
            <Field label="Email"      value={user.email} />
            <Field label="Officer ID" value={user.id || user._id} />
          </div>
        </div>

        {/* DEPARTMENT CARD */}
        <div className="bg-[#2a2a2f] p-8 rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-bold text-[#e8d4a2] mb-6">Assigned Department</h2>

          {loading ? (
            <p className="text-gray-400">Loading department info...</p>
          ) : dept ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Department Name"  value={dept.name} />
              <Field label="Department Head"  value={dept.deptHead} />
              <Field label="Category"         value={dept.category_handled} />
              <Field label="Email"            value={dept.email} />
              <Field label="Phone"            value={dept.phone} />
              <Field label="District"         value={dept.district} />
              <Field label="Pincode"          value={dept.pincode} />
            </div>
          ) : (
            <p className="text-gray-500">No department linked to this account.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default OfficerProfile;
