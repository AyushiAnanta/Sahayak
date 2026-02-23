import React, { useState } from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";

// import translations
import hi from "../translations/hi.json";
import mr from "../translations/mr.json";
import ur from "../translations/ur.json";
import pa from "../translations/pa.json";
import en from "../translations/en.json";

const TEXTS = { en, hi, mr, ur, pa };

const AuthLayout = ({ children, showBranding = true }) => {
  const [lang, setLang] = useState("en");

  const t = TEXTS[lang] || TEXTS.en;

  return (
    <div
      className="min-h-screen bg-[#27272a] flex items-center justify-center px-4 relative"
      style={{
        direction: t.direction || "ltr",
        textAlign: t.direction === "rtl" ? "right" : "left",
      }}
    >
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

        {showBranding && (
          <div className="hidden lg:flex flex-col justify-center items-center gap-8">
            <h1 className="text-7xl font-bold text-[#ffe6a7]">
            {/*{t.brandTitle || "sahayak"}*/}
            {"chuglimanch"}
            </h1>

            <p className="text-neutral-300 text-center max-w-md">
              {t.brandDescription ||
                "Your digital grievance assistant helping citizens connect with authorities efficiently."}
            </p>
          </div>
        )}

        <div className="w-full flex justify-center">
          {React.isValidElement(children)
            ? React.cloneElement(children, { lang })
            : children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;