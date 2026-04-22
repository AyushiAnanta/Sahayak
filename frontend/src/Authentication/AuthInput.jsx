import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AuthInput = ({ name, type, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="relative">
      <input
        name={name}
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-300 focus:border-[#6c584c] focus:ring-2 focus:ring-[#6c584c]/20 outline-none transition"
      />

      {/* 👁️ Professional Eye Icon */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6c584c] transition"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
  );
};

export default AuthInput;