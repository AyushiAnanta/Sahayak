// pages/department/AssignedComplaints.jsx

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getDepartmentGrievances, updateStatus } from "../../api/department";

const AssignedComplaints = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await getDepartmentGrievances(user.departmentId);

      const complaints =
        res?.data?.data ||
        res?.data?.grievances ||
        res?.data ||
        [];

      setData(complaints);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus(id, status);
      fetchComplaints();
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "in_progress":
        return "text-blue-400";
      case "resolved":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">

      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      <div className="pt-24 px-6 md:px-10">

        <h1 className="text-3xl font-bold mb-6 text-[#e8d4a2]">
          Assigned Complaints
        </h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400">No complaints found</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">

            {data.map((g) => (
              <div
                key={g._id}
                className="bg-[#2a2a2f] p-6 rounded-xl border border-gray-700 hover:scale-[1.02] transition"
              >

                <h2 className="text-lg font-semibold">
                  {g.originalText || "No description"}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  District: {g.district || "N/A"}
                </p>

                <p className="text-sm mt-2">
                  Status:
                  <span className={`ml-2 ${getStatusColor(g.status)}`}>
                    {g.status}
                  </span>
                </p>

                {/* STATUS UPDATE */}
                <select
                  value={g.status}
                  onChange={(e) =>
                    handleStatusChange(g._id, e.target.value)
                  }
                  className="mt-4 w-full bg-[#1f1f23] border border-gray-600 p-2 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default AssignedComplaints;