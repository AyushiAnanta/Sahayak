import React, { useState } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";

const LoginForm = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log(email, password);
  };

  return (
    <div className="w-full max-w-md bg-neutral-200 p-8 rounded-2xl shadow-xl">

      <h2 className="text-3xl font-bold mb-2 text-center">
        Welcome Back
      </h2>

      <p className="text-center mb-6 text-sm">
        Login to continue
      </p>

      <div className="flex flex-col gap-4">
        <AuthInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleLogin}
        className="w-full mt-6 py-3 bg-[#6c584c] text-white rounded-full"
      >
        Login
      </button>

      <GoogleAuthButton />

      <p className="text-center mt-6 text-sm">
        Don't have an account?
        <button
          onClick={switchToSignup}
          className="ml-2 font-bold"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;