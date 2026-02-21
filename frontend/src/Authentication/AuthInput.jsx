import React from "react";

const AuthInput = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
        w-full
        p-3
        bg-neutral-100
        border-b-2 border-[#6c584c]
        focus:outline-none
      "
    />
  );
};

export default AuthInput;