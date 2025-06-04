"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FaBars, FaBell, FaTimes } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "All Users", href: "/allUsers" },
  { label: "Global Board", href: "/globalBoard" },
  //{ label: "Challenges", href: "/challengesPage" },
  { label: "Challenge", href: "/addExam" },
  { label: "Subject", href: "/addSubjects" },
  { label: "Questions", href: "/addQuestion" },
  { label: "Rules", href: "/ruleId" },
  { label: "Challenge Requirements", href: "/challengeRequirement" },
  { label: "Prize Details", href: "/prizeDetails" },
  { label: "Special Events", href: "/createSpecialEvent" },
  { label: "Win a Laptop", href: "/winLaptopDetails" },
  { label: "Eligibility", href: "/eligibilityDetails" },
  { label: "Participation", href: "/participationPage" },
  //{ label: "Challenge Requirement", href: "/challengeRequirement" },
  { label: "More", href: "/admin/more" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={clsx(
          "fixed z-20 md:relative md:translate-x-0 transition-transform duration-200 ease-in-out bg-black w-64 text-white h-full flex flex-col overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button - mobile only */}
        <button
          className="absolute top-4 right-4 text-white md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes size={20} />
        </button>

        {/* Top Logo */}
        <div className="p-4 flex justify-center items-center">
          <Image src="/logo.png" alt="Logo" width={120} height={40} />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col justify-center px-4 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "text-white hover:bg-gray-700 p-2 rounded cursor-pointer px-10 block",
                  isActive && "bg-purple-600"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="w-full bg-white shadow p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden text-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={24} />
            </button>

            {/* Search Input */}
            <div className="flex items-center w-full max-w-sm">
              <div className="flex items-center bg-blue-100 px-3 py-2 rounded-l-sm flex-grow">
                <FiSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent outline-none placeholder-gray-500 text-sm ml-2"
                />
              </div>
              <button className="bg-purple-600 text-white text-sm px-4 py-2 rounded-r-sm hover:bg-purple-700">
                Search
              </button>
            </div>
          </div>

          {/* Notification and Profile */}
          <div className="flex items-center space-x-4">
            <FaBell size={20} className="text-purple-600 cursor-pointer" />
            <div className="flex items-center space-x-2">
              <Image
                src="/profile.png"
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
              <div className="leading-tight">
                <p className="text-purple-600 font-semibold">
                  Rashidatul Kobra
                </p>
                <p className="text-sm text-black">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 overflow-y-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
