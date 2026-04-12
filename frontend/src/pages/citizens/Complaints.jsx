import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserGrievances } from "../../api/grievance";
import Navbar from "../../components/Navbar";

const Complaints = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await getUserGrievances();

        // ✅ SAFE DATA HANDLING
        const data =
          res.data?.data ||
          res.data?.grievances ||
          [];

        setGrievances(Array.isArray(data) ? data : []);

      } catch (err) {
        setError(err.message || "Failed to fetch complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // 🎨 STATUS COLORS
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

      {/* ✅ NAVBAR */}
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      {/* ✅ CONTENT (IMPORTANT FIX: pt-24) */}
      <div className="pt-24 px-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#e8d4a2]">
            All Complaints
          </h1>

          <button
            onClick={() => navigate("/dashboard/create")}
            className="bg-[#6c584c] px-5 py-2 rounded-lg hover:opacity-90"
          >
            + New Complaint
          </button>
        </div>

        {/* STATES */}
        {loading && (
          <p className="text-gray-400">Loading complaints...</p>
        )}

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {!loading && grievances.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg">
              No complaints found
            </p>

            <button
              onClick={() => navigate("/dashboard/create")}
              className="mt-4 bg-[#6c584c] px-6 py-3 rounded-lg"
            >
              Create First Complaint
            </button>
          </div>
        )}

        {/* LIST */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {grievances.map((g) => (
            <div
              key={g._id}
              onClick={() =>
                navigate(`/dashboard/status?id=${g._id}`)
              }
              className="bg-[#2a2a2f] p-5 rounded-xl shadow cursor-pointer hover:scale-[1.02] hover:border border-[#6c584c] transition"
            >
              {/* TITLE */}
              <h2 className="text-lg font-semibold line-clamp-2">
                {g.originalText || "No description"}
              </h2>

              {/* CATEGORY */}
              <p className="text-sm text-gray-400 mt-2">
                Category: {g.category || "N/A"}
              </p>

              {/* LOCATION */}
              <p className="text-sm text-gray-400">
                📍 {g.district || "N/A"} | {g.pincode || "N/A"}
              </p>

              {/* STATUS */}
              <p className="text-sm mt-2">
                Status:{" "}
                <span className={getStatusColor(g.status)}>
                  {g.status}
                </span>
              </p>

              {/* PRIORITY */}
              <p className="text-sm mt-1">
                Priority:{" "}
                <span className="text-purple-400">
                  {g.priorityScore ?? "N/A"}
                </span>
              </p>

              {/* DATE */}
              <p className="text-xs text-gray-500 mt-3">
                {g.createdAt
                  ? new Date(g.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Complaints;