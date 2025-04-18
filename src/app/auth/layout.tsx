// src/app/auth/layout.tsx

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
        <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl shadow-2xl px-6 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;