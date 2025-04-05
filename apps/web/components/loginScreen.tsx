"use client";

import React from "react";
import { GoogleLoginButton } from "@repo/ui";

const LoginScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6 animate-typing whitespace-nowrap overflow-hidden border-r-4 border-black w-fit mx-auto">
          Hi, Welcome to Finance GPT
        </h1>
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default LoginScreen;
