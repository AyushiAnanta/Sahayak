import React from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const AuthLayout = ({ children, showBranding = true }) => {
  const { t, i18n } = useTranslation();

  return (
    <div
      className="min-h-screen bg-[#27272a] flex items-center justify-center px-4 relative"
      style={{
        direction: i18n.language === "ur" ? "rtl" : "ltr",
        textAlign: i18n.language === "ur" ? "right" : "left",
      }}
    >
      {/* 🌐 Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

        {/* 🔹 Branding */}
        {showBranding && (
          <div className="hidden lg:flex flex-col justify-center items-center gap-8">
            <h1 className="text-7xl font-bold text-[#ffe6a7]">
              {t("brandTitle")}
            </h1>

            <p className="text-neutral-300 text-center max-w-md">
              {t("brandDescription")}
            </p>
          </div>
        )}

        {/* 🔹 Form Section */}
        <div className="w-full flex justify-center">
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;