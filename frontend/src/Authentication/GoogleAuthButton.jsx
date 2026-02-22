import React from "react";

const GoogleAuthButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/google";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full mt-4 py-3 border border-gray-400 rounded-full flex justify-center items-center gap-2"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="w-5 h-5"
      />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleAuthButton;
