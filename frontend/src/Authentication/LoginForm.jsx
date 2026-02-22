import React, { useState } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginUser } from "../api/auth";

const LoginForm = ({ switchToSignup }) => {
  const [form, setForm] = useState({
    identifier: "", 
    password: "",
  });

  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleLogin = async () => {
    const { identifier, password } = form;

    if (!identifier || !password) {
      alert("Enter email/username and password");
      return;
    }

    try {
      setLoading(true);


      const isEmail = identifier.includes("@");

      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const data = await loginUser(payload);

      localStorage.setItem("user", JSON.stringify(data.data || data));

      alert("Login successful ");
      window.location.href = "/dashboard"; 

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-neutral-200">
      <h2 className="text-3xl font-bold text-center text-neutral-800">
        Welcome Back
      </h2>

      <p className="text-center mt-2 text-sm text-neutral-500">
        Login with email or username
      </p>

      <div className="flex flex-col gap-4 mt-6">

        <AuthInput
          name="identifier"
          type="text"
          placeholder="Email or Username"
          value={form.identifier}
          onChange={handleChange}
        />


        <AuthInput
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full mt-6 py-3 rounded-xl bg-[#6c584c] hover:bg-[#5a483f] text-white font-semibold transition disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="mt-4">
        <GoogleAuthButton />
      </div>

      <p className="text-center mt-6 text-sm text-neutral-600">
        Don't have an account?
        <button
          onClick={switchToSignup}
          className="ml-2 font-semibold text-[#6c584c] hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;