import React, { useState } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginUser } from "../api/auth";

import hi from "../translations/hi.json";
import mr from "../translations/mr.json";
import ur from "../translations/ur.json";
import pa from "../translations/pa.json";
import bn from "../translations/bn.json";
import en from "../translations/en.json";

const TEXTS = { en, hi, mr, ur, pa,bn };

const LoginForm = ({ switchToSignup, lang = "en" }) => {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = TEXTS[lang] || TEXTS.en;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    const { identifier, password } = form;

    if (!identifier || !password) {
      setError(t.errorFill || "Enter email/username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const isEmail = identifier.includes("@");

      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const data = await loginUser(payload);

      localStorage.setItem("user", JSON.stringify(data.data || data));

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || t.invalid || "Invalid email/username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-neutral-200"
      style={{
        direction: t.direction || "ltr",
        textAlign: t.direction === "rtl" ? "right" : "left",
      }}
    >
      <h2 className="text-3xl font-bold text-center text-neutral-800">
        {t.welcome || "Welcome Back"}
      </h2>

      <p className="text-center mt-2 text-sm text-neutral-500">
        {t.subtitle || "Login with email or username"}
      </p>

      <div className="flex flex-col gap-4 mt-6">

        <AuthInput
          name="identifier"
          type="text"
          placeholder={t.identifierPlaceholder || "Email or Username"}
          value={form.identifier}
          onChange={handleChange}
        />

        <AuthInput
          name="password"
          type="password"
          placeholder={t.passwordPlaceholder || "Password"}
          value={form.password}
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full mt-6 py-3 rounded-xl bg-[#6c584c] hover:bg-[#5a483f] text-white font-semibold transition disabled:opacity-50"
      >
        {loading ? (t.loggingIn || "Logging in...") : (t.loginButton || "Login")}
      </button>

      <div className="mt-4">
        <GoogleAuthButton />
      </div>

      <p className="text-center mt-6 text-sm text-neutral-600">
        {t.noAccount || "Don't have an account?"}
        <button
          onClick={switchToSignup}
          className="ml-2 font-semibold text-[#6c584c] hover:underline"
        >
          {t.signup || "Sign Up"}
        </button>
      </p>
    </div>
  );
};

export default LoginForm;