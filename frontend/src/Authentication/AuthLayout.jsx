import React from "react";

const AuthLayout = ({ children, showBranding = true }) => {
  return (
    <div className="min-h-screen bg-[#27272a] flex items-center justify-center px-4">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

        {/* Branding Section */}
        {showBranding && (
          <div className="hidden lg:flex flex-col justify-center items-center gap-8">

            <h1 className="text-7xl font-bold text-[#ffe6a7]">
              sahayak
            </h1>

            <p className="text-neutral-300 text-center max-w-md">
              Your digital grievance assistant helping citizens connect
              with authorities efficiently.
            </p>

          </div>
        )}

        {/* Auth Card */}
        <div className="w-full flex justify-center">
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;