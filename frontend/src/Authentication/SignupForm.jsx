import React, { useState } from "react";
import AuthInput from "./AuthInput";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerUser } from "../api/auth";

// import translations (same as login)
import hi from "../translations/hi.json";
import mr from "../translations/mr.json";
import ur from "../translations/ur.json";
import pa from "../translations/pa.json";
import en from "../translations/en.json";

const TEXTS = { en, hi, mr, ur, pa };

const SignupForm = ({ switchToLogin, lang = "en" }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // selected language text (same as login)
  const t = TEXTS[lang] || TEXTS.en;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async () => {
    const { name, username, email, password } = form;

    if (!name || !username || !email || !password) {
      setError(t.errorFill || "All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerUser(form);

      // optional success message
      setError(t.signupSuccess || "Account created successfully");

      setTimeout(() => switchToLogin(), 1500);
    } catch (err) {
      setError(err.message || t.signupFailed || "Signup failed");
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
        {t.createAccount || "Create Account"}
      </h2>

      <p className="text-center mt-2 text-sm text-neutral-500">
        {t.signupSubtitle || "Join Sahāyak grievance portal"}
      </p>

      <div className="flex flex-col gap-4 mt-6">
        <AuthInput
          name="name"
          type="text"
          placeholder={t.fullNamePlaceholder || "Full Name"}
          value={form.name}
          onChange={handleChange}
        />

        <AuthInput
          name="username"
          type="text"
          placeholder={t.usernamePlaceholder || "Username"}
          value={form.username}
          onChange={handleChange}
        />

        <AuthInput
          name="email"
          type="email"
          placeholder={t.emailPlaceholder || "Email address"}
          value={form.email}
          onChange={handleChange}
        />

        <AuthInput
          name="password"
          type="password"
          placeholder={t.passwordPlaceholder || "Password"}
          value={form.password}
          onChange={handleChange}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-[#6c584c] focus:ring-2 focus:ring-[#6c584c]/20 outline-none transition bg-white"
        >
          <option value="user">{t.user || "User"}</option>
          <option value="officer">{t.officer || "Officer"}</option>
        </select>
      </div>

      {/* same error style as login */}
      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full mt-6 py-3 rounded-xl bg-[#6c584c] hover:bg-[#5a483f] text-white font-semibold transition disabled:opacity-50"
      >
        {loading
          ? t.creatingAccount || "Creating account..."
          : t.signupButton || "Sign Up"}
      </button>

      <div className="mt-4">
        <GoogleAuthButton />
      </div>

      <p className="text-center mt-6 text-sm text-neutral-600">
        {t.haveAccount || "Already have an account?"}
        <button
          onClick={switchToLogin}
          className="ml-2 font-semibold text-[#6c584c] hover:underline"
        >
          {t.login || "Login"}
        </button>
      </p>
    </div>
  );
};

export default SignupForm;