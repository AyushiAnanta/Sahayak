import React, { useState } from "react";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const LANGUAGES = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  bn: "বাংলা",
  pa: "ਪੰਜਾਬੀ",
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();

  const changeLang = (code) => {
    i18n.changeLanguage(code);          // ✅ change globally
    localStorage.setItem("lang", code); // ✅ persist
    setOpen(false);
  };

  return (
    <div className="relative">
      <FaGlobe
        size={24}
        className="cursor-pointer text-white"
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="absolute right-0 mt-3 bg-white border rounded-lg shadow-xl p-3 min-w-[140px]">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <div
              key={code}
              onClick={() => changeLang(code)}
              className={`px-2 py-1 cursor-pointer rounded hover:bg-gray-100 ${
                i18n.language === code ? "font-semibold" : ""
              }`}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}