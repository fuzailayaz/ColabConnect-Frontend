"use client"; // Ensure this is a client component

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const pathname = usePathname(); // Replaces useRouter()

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-gray-900">
          CollabConnect
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/dashboard" className={`hover:text-blue-600 ${pathname === "/dashboard" ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
            Dashboard
          </Link>
          <Link href="/projects" className={`hover:text-blue-600 ${pathname === "/projects" ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
            Projects
          </Link>
          <Link href="/teams" className={`hover:text-blue-600 ${pathname === "/teams" ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
            Teams
          </Link>
          <Link href="/messages" className={`hover:text-blue-600 ${pathname === "/messages" ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
            Messages
          </Link>
        </div>

        {/* Authentication and Profile */}
        <div className="hidden md:flex space-x-4 items-center">
          <Link href="/profile" className="text-gray-700 hover:text-blue-600">
            Profile
          </Link>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Logout
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          {/* Implement mobile menu button here if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
