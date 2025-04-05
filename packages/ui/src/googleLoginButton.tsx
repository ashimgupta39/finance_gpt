"use client";

import React from "react";

const BACKEND_URL = "http://localhost:8000";

const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        all: "unset", // remove all default styles
        cursor: "pointer",
        display: "inline-block"
      }}
    >
      <img
        src="https://i.imgur.com/yczPzHD.png"
        alt="Sign in with Google"
        style={{
          display: "block",
          width: "300px", // adjust as per your need
        }}
      />
    </button>
  );
};

export default GoogleLoginButton;
