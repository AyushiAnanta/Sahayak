import React, { useState, useEffect } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const LoginForm = ({ switchToSignup }) => {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle RTL dynamically
  useEffect(() => {
    document.body.dir = i18n.language === "ur" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    const { identifier, password } = form;

    if (!identifier || !password) {
      setError(t("errorFill"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const isEmail = identifier.includes("@");
      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await loginUser(payload);

      // ✅ ONLY USER (token is in cookie)
      const userData = response?.data?.user;

      if (!userData) {
        throw new Error(t("loginFailed"));
      }

      // ✅ Save only user
      login(userData);

      // ✅ Redirect
      if (userData?.role === "department") {
        window.location.href = "/department";
      } else if (userData?.role === "officer") {
        window.location.href = "/officer";
      } else if (userData?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);
      setError(err.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-neutral-200"
      style={{
        direction: i18n.language === "ur" ? "rtl" : "ltr",
        textAlign: i18n.language === "ur" ? "right" : "left",
      }}
    >
      <h2 className="text-3xl font-bold text-center text-neutral-800">
        {t("welcome")}
      </h2>

      <p className="text-center mt-2 text-sm text-neutral-500">
        {t("subtitle")}
      </p>

      <div className="flex flex-col gap-4 mt-6">
        <AuthInput
          name="identifier"
          type="text"
          placeholder={t("identifierPlaceholder")}
          value={form.identifier}
          onChange={handleChange}
        />
        <AuthInput
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
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
        {loading ? t("loggingIn") : t("loginButton")}
      </button>

      <div className="mt-4">
        <GoogleAuthButton />
      </div>

      <p className="text-center mt-6 text-sm text-neutral-600">
        {t("noAccount")}
        <button
          onClick={switchToSignup}
          className="ml-2 font-semibold text-[#6c584c] hover:underline"
        >
          {t("signup")}
        </button>
      </p>
    </div>
  );
};

export default LoginForm;