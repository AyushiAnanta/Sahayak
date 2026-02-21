import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout>
      {isLogin ? (
        <LoginForm switchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupForm switchToLogin={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  );
};

export default Authentication;