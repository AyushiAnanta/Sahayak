import React, { useState, useEffect } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser } from "../api/auth";
import { useTranslation } from "react-i18next";

const SignupForm = ({ switchToLogin }) => {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ RTL support
  useEffect(() => {
    document.body.dir = i18n.language === "ur" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async () => {
    const { name, username, email, password } = form;

    if (!name || !username || !email || !password) {
      setError(t("errorFill"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerUser(form);

      setError(t("signupSuccess"));

      setTimeout(() => switchToLogin(), 1500);
    } catch (err) {
      setError(err.message || t("signupFailed"));
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
        {t("createAccount")}
      </h2>

      <p className="text-center mt-2 text-sm text-neutral-500">
        {t("signupSubtitle")}
      </p>

      <div className="flex flex-col gap-4 mt-6">
        <AuthInput
          name="name"
          type="text"
          placeholder={t("fullNamePlaceholder")}
          value={form.name}
          onChange={handleChange}
        />

        <AuthInput
          name="username"
          type="text"
          placeholder={t("usernamePlaceholder")}
          value={form.username}
          onChange={handleChange}
        />

        <AuthInput
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          value={form.email}
          onChange={handleChange}
        />

        <AuthInput
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          value={form.password}
          onChange={handleChange}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-[#6c584c] focus:ring-2 focus:ring-[#6c584c]/20 outline-none transition bg-white"
        >
          <option value="user">{t("user")}</option>
          <option value="officer">{t("officer")}</option>
        </select>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full mt-6 py-3 rounded-xl bg-[#6c584c] hover:bg-[#5a483f] text-white font-semibold transition disabled:opacity-50"
      >
        {loading ? t("creatingAccount") : t("signupButton")}
      </button>

      <div className="mt-4">
        <GoogleAuthButton />
      </div>

      <p className="text-center mt-6 text-sm text-neutral-600">
        {t("haveAccount")}
        <button
          onClick={switchToLogin}
          className="ml-2 font-semibold text-[#6c584c] hover:underline"
        >
          {t("login")}
        </button>
      </p>
    </div>
  );
};

export default SignupForm;