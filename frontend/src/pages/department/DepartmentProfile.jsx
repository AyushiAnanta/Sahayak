import React, { useEffect, useState } from "react";
import DepartmentNavbar from "../../components/DepartmentNavbar";
import { getDepartmentById } from "../../api/department";

const InputField = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-400 mb-1">{label}</label>
    <div className="bg-[#1f1f23] px-3 py-2 rounded-lg border border-gray-700 text-white">
      {value || "N/A"}
    </div>
  </div>
);

const DepartmentProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDept = async () => {
      if (!storedUser?.departmentId) { setLoading(false); return; }
      try {
        const res = await getDepartmentById(storedUser.departmentId);
        setDept(res?.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDept();
  }, []);

  if (!storedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#1f1f23]">
        No user data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <DepartmentNavbar
        user={storedUser}
        onLogout={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
      />

      <div className="pt-24 flex justify-center px-6">
        <div className="w-full max-w-4xl space-y-6">

          {/* OFFICER CARD */}
          <div className="bg-[#2a2a2f] p-8 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[#e8d4a2] mb-6">Officer Profile</h2>

            <div className="flex flex-col items-center mb-8">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${storedUser?.name}`}
                className="w-24 h-24 rounded-full bg-gray-800 p-2 border border-gray-600"
              />
              <p className="mt-3 text-lg font-semibold">{storedUser.name}</p>
              <p className="text-sm text-gray-400">{storedUser.email}</p>
              <p className="text-xs text-blue-400 mt-1 uppercase">{storedUser.role}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField label="Full Name"   value={storedUser.name} />
              <InputField label="Username"    value={storedUser.username} />
              <InputField label="Email"       value={storedUser.email} />
              <InputField label="Officer ID"  value={storedUser.id || storedUser._id} />
            </div>
          </div>

          {/* DEPARTMENT CARD */}
          <div className="bg-[#2a2a2f] p-8 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[#e8d4a2] mb-6">Department Info</h2>

            {loading ? (
              <p className="text-gray-400">Loading department info...</p>
            ) : dept ? (
              <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Department Name"      value={dept.name} />
                <InputField label="Department Head"      value={dept.deptHead} />
                <InputField label="Category Handled"     value={dept.category_handled} />
                <InputField label="Email"                value={dept.email} />
                <InputField label="Phone"                value={dept.phone} />
                <InputField label="District"             value={dept.district} />
                <InputField label="Pincode"              value={dept.pincode} />
                <InputField label="Department ID"        value={dept._id} />
              </div>
            ) : (
              <p className="text-gray-500">No department linked to this account.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DepartmentProfile;
