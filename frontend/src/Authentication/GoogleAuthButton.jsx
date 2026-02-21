import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthButton = () => {
  return (
    <div className="w-full mt-3">
      <GoogleLogin
        onSuccess={(res) => {
          console.log("Google success", res);
        }}
        onError={() => console.log("Google Login Failed")}
      />
    </div>
  );
};

export default GoogleAuthButton;