import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem("lang") || "en"
  );

  const dropdownRef = useRef();
  const langRef = useRef();

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || "user"}`;

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
    { code: "bn", label: "বাংলা" },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const isActive = (path) =>
    location.pathname === path ? "text-white font-semibold" : "text-gray-300";

  return (
    <div key={i18n.language}> {/* FORCE RE-RENDER */}

      <nav className="fixed top-0 left-0 w-full z-50 bg-[#1f1f23]/80 backdrop-blur-md border-b border-gray-700 px-10 py-4 flex justify-between items-center">

        {/* LOGO */}
        <h1
          className="text-2xl font-bold text-[#e8d4a2] cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          {t("brandTitle") || "Sahayak"}
        </h1>

        {/* NAV LINKS */}
        <div className="flex gap-8 items-center font-medium">

          <button
            onClick={() => navigate("/dashboard")}
            className={`${isActive("/dashboard")} hover:text-white`}
          >
            {t("home") || "Home"}
          </button>

          <button
            onClick={() => navigate("/dashboard/create")}
            className={`${isActive("/dashboard/create")} hover:text-white`}
          >
            {t("create") || "Create"}
          </button>

          <button
            onClick={() => navigate("/dashboard/complaints")}
            className={`${isActive("/dashboard/complaints")} hover:text-white`}
          >
            {t("complaints") || "Complaints"}
          </button>

          {/* 🌐 LANGUAGE */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-xl hover:scale-110 transition"
            >
              🌐
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-[#2a2a2f] text-white rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                {languages.map((lang) => {
                  const isSelected = selectedLang === lang.code;

                  return (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        await i18n.changeLanguage(lang.code); 

                        setSelectedLang(lang.code);
                        localStorage.setItem("lang", lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 transition
                        ${
                          isSelected
                            ? "bg-[#6c584c]/30 text-[#e8d4a2]"
                            : "hover:bg-gray-700"
                        }
                      `}
                    >
                      <span>{lang.label}</span>
                      {isSelected && (
                        <span className="text-green-400 font-bold">✔</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative" ref={dropdownRef}>
            <img
              src={avatarUrl}
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full cursor-pointer border border-gray-600 hover:scale-105 transition"
              alt="profile"
            />

            {open && (
              <div className="absolute right-0 mt-3 w-64 bg-[#2a2a2f] text-white shadow-xl rounded-xl p-4 border border-gray-700">

                <div className="flex gap-3 items-center pb-3 border-b border-gray-600">
                  <img src={avatarUrl} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{user?.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col mt-3 gap-2">
                  <button
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setOpen(false);
                    }}
                    className="p-2 rounded text-left hover:bg-gray-700"
                  >
                    {t("profile") || "Profile"}
                  </button>

                  <button
                    onClick={() => setShowConfirm(true)}
                    className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    {t("logout") || "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* LOGOUT MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#2a2a2f] p-6 rounded-xl text-white w-80 text-center shadow-xl">
            <h2 className="text-lg font-bold">{t("confirmLogout") || "Confirm Logout"}</h2>
            <p className="text-gray-400 mt-2">{t("areYouSure") || "Are you sure?"}</p>

            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
              >
                {t("cancel") || "Cancel"}
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  onLogout();
                }}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                {t("logout") || "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;