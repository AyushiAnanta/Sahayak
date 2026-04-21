import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserGrievances,
  deleteGrievance
} from "../../api/grievance";
import Navbar from "../../components/Navbar";

const Complaints = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH COMPLAINTS
  const fetchComplaints = async () => {
    try {

      const res = await getUserGrievances();

        let data =
        res?.data?.data?.grievances ||   // ✅ correct path
          res?.data?.grievances ||
        [];

      setGrievances(data);

    } catch (err) {
      console.error("Error fetching complaints:", err);
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // DELETE COMPLAINT
  const handleDelete = async (id) => {
    try {

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this complaint?"
      );

      if (!confirmDelete) return;

      await deleteGrievance(id);

      setGrievances((prev) =>
        prev.filter((g) => g._id !== id)
      );

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // STATUS COLORS
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">

      {/* NAVBAR */}
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      <div className="pt-24 px-6 md:px-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">

          <h1 className="text-3xl font-bold text-[#e8d4a2]">
            All Complaints
          </h1>

          <button
            onClick={() => navigate("/dashboard/create")}
            className="bg-[#6c584c] px-5 py-2 rounded-lg hover:opacity-90 shadow"
          >
            + New Complaint
          </button>

        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-gray-400">Loading complaints...</p>
        ) : grievances.length === 0 ? (

          <p className="text-gray-400">
            No complaints found.
          </p>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {grievances.map((g) => (

              <div
                key={g._id}
                className="bg-[#2a2a2f]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-[#6c584c] transition-all duration-300"
              >

                {/* TITLE */}
                <h2 className="text-lg font-semibold mb-2">
                  {g.originalText}
                </h2>

                {/* CATEGORY */}
                <p className="text-sm text-gray-400">
                  Category: {g.category}
                </p>

                {/* LOCATION */}
                <p className="text-sm text-gray-400 mt-1">
                  📍 {g.district} | {g.pincode}
                </p>

                {/* STATUS */}
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(g.status)}`}
                  >
                    {g.status?.replace("_", " ")}
                  </span>
                </div>

                {/* DATE */}
                <p className="text-xs text-gray-500 mt-4">
                  {new Date(g.createdAt).toLocaleString()}
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() =>
                      navigate(`/dashboard/status?id=${g._id}`)
                    }
                    className="text-xs px-3 py-1 bg-gray-700 rounded"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/dashboard/create?id=${g._id}`)
                    }
                    className="text-xs px-3 py-1 bg-blue-600 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(g._id)}
                    className="text-xs px-3 py-1 bg-red-600 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}
      </div>
    </div>
  );
};

export default Complaints;