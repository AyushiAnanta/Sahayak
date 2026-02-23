import React, { useState } from "react";
import { FaGlobe } from "react-icons/fa";

const LANGUAGES = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  bn: "বাংলা",  
  ur: "اردو",
  pa: "ਪੰਜਾਬੀ",
};

export default function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  const changeLang = (code) => {
    setLang(code);  
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
                lang === code ? "font-semibold" : ""
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