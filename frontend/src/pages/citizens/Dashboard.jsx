import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserGrievances } from "../../api/grievance";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    document.body.dir = i18n.language === "ur" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const res = await getUserGrievances();
        const data = res.data?.data?.grievances || [];
        setGrievances(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [i18n.language]);

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

  const total = grievances.length;
  const pending = grievances.filter((g) => g.status === "pending").length;
  const resolved = grievances.filter((g) => g.status === "resolved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f23] to-[#26262b] text-white">

      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      <div className="pt-24">
        <div className="max-w-6xl mx-auto p-10">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">
                {t("Dashboard")}
              </h2>
              <p className="text-gray-400 text-sm">
                {t("DashboardSubtitle")}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/create")}
              className="bg-[#6c584c] px-5 py-2 rounded-lg hover:opacity-90"
            >
              {t("createGrievance")}
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-[#2a2a2f] p-6 rounded-xl">
              <p className="text-gray-400">{t("total")}</p>
              <h2 className="text-2xl font-bold">{total}</h2>
            </div>

            <div className="bg-[#2a2a2f] p-6 rounded-xl">
              <p className="text-gray-400">{t("pending")}</p>
              <h2 className="text-2xl font-bold text-yellow-400">{pending}</h2>
            </div>

            <div className="bg-[#2a2a2f] p-6 rounded-xl">
              <p className="text-gray-400">{t("resolved")}</p>
              <h2 className="text-2xl font-bold text-green-400">{resolved}</h2>
            </div>
          </div>

          {/* STATES */}
          {loading && <p className="text-gray-400">{t("loading")}</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* EMPTY */}
          {!loading && grievances.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="text-6xl mb-4">📭</div>

              <h2 className="text-xl font-semibold">
                {t("noGrievances")}
              </h2>

              <p className="text-gray-400 mt-2 text-center max-w-md">
                {t("noGrievancesDesc")}
              </p>

              <button
                onClick={() => navigate("/dashboard/create")}
                className="mt-6 bg-[#6c584c] px-6 py-3 rounded-lg hover:opacity-90"
              >
                {t("createFirstGrievance")}
              </button>
            </div>
          )}

          {/* LIST */}
          <div className="grid md:grid-cols-2 gap-6">
            {Array.isArray(grievances) &&
              grievances.map((g) => (
                <div
                  key={g._id}
                  className="bg-[#2a2a2f] p-5 rounded-xl shadow hover:scale-[1.02] transition cursor-pointer"
                  onClick={() => navigate(`/dashboard/status?id=${g._id}`)}
                >
                  <h3 className="text-lg font-semibold">
                    {g.originalText}
                  </h3>

                  <p className="text-sm text-gray-400 mt-2">
                   {t("category")}: {g.category ? t(g.category) : t("na")}
                  </p>

                  <p className="text-sm mt-1">
                    {t("status")}:{" "}
                    <span className={getStatusColor(g.status)}>
                      {t(g.status)} {/* optional translation */}
                    </span>
                  </p>

                  <p className="text-sm mt-1">
                    {t("priority")}:{" "}
                    <span className="text-purple-400">
                      {g.priorityScore ?? "N/A"}
                    </span>
                  </p>
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;