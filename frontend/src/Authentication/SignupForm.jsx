import React, { useState } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser } from "../api/auth";

const SignupForm = ({ switchToLogin }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user", 
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // signup
  const handleSignup = async () => {
    const { name, username, email, password } = form;

    if (!name || !username || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await registerUser(form);

      alert("Account created successfully 🎉");
      switchToLogin();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-neutral-200">
      <h2 className="text-3xl font-bold text-center text-neutral-800">
        Create Account
      </h2>

      <p className="text-center mt-2 text-sm text-neutral-500">
        Join Sahāyak grievance portal
      </p>

      <div className="flex flex-col gap-4 mt-6">
        <AuthInput
          name="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <AuthInput
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />

        <AuthInput
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
        />

        <AuthInput
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />


        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-[#6c584c] focus:ring-2 focus:ring-[#6c584c]/20 outline-none transition bg-white"
        >
          <option value="user">User</option>
          <option value="officer">Officer</option>
        </select>
      </div>

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full mt-6 py-3 rounded-xl bg-[#6c584c] hover:bg-[#5a483f] text-white font-semibold transition-all disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <div className="mt-4">
        <GoogleAuthButton />
      </div>

      <p className="text-center mt-6 text-sm text-neutral-600">
        Already have an account?
        <button
          onClick={switchToLogin}
          className="ml-2 font-semibold text-[#6c584c] hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupForm;