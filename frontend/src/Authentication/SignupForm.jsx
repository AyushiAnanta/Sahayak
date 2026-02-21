import React, { useState } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";

const SignupForm = ({ switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    console.log(email, username, password);
  };

  return (
    <div className="w-full max-w-md bg-neutral-200 p-8 rounded-2xl shadow-xl">

      <h2 className="text-3xl font-bold mb-2 text-center">
        Create Account
      </h2>

      <p className="text-center mb-6 text-sm">
        Join Sahāyak grievance portal
      </p>

      <div className="flex flex-col gap-4">
        <AuthInput
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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
        onClick={handleSignup}
        className="w-full mt-6 py-3 bg-[#6c584c] text-white rounded-full"
      >
        Sign Up
      </button>

      <GoogleAuthButton />

      <p className="text-center mt-6 text-sm">
        Already have an account?
        <button
          onClick={switchToLogin}
          className="ml-2 font-bold"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupForm;