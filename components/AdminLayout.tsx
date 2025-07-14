"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { useState } from "react";
import {
  FaBars,
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa"; // Added FaSignOutAlt, removed FaUserCircle as it wasn't used

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "LeaderBoard", href: "/globalBoard" },
  { label: "All Users", href: "/allUsers" },

  { label: "Challenge", href: "/addExam" },
  { label: "Questions", href: "/addQuestion" },
  { label: "Subject", href: "/addSubjects" },
  { label: "Challenge Requirements", href: "/challengeRequirement" },

  { label: "Prize Details", href: "/prizeDetails" },
  { label: "Special Events", href: "/createSpecialEvent" },
  { label: "Eligibility Details", href: "/eligibilityDetails" },
  { label: "Win a Laptop", href: "/winLaptopDetails" },
  { label: "Participants", href: "/participationPage" },

  { label: "Notifications", href: "/notifications" },
  { label: "Transaction", href: "/transaction" },
  { label: "Banks", href: "/Banks" },
  { label: "Rules", href: "/ruleId" },

  { label: "Social Media", href: "/socialMedia" },
  { label: "Terms of Service", href: "/services" },
  { label: "Breaking News", href: "/breakingNews" },
  // { label: "Contact Us", href: "/contact" },
  { label: "About Us", href: "/aboutUs" },
  { label: "Log Out", href: "#logout" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    destroyCookie(null, "token");
    destroyCookie(null, "user");
    router.push("/signIn");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true" // Indicate to screen readers that this is a decorative overlay
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 transform md:translate-x-0 transition-transform duration-300 ease-in-out",
          "bg-black text-white shadow-xl", // Original black background + added shadow
          "w-64 flex-shrink-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button - mobile only */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 md:hidden p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <FaTimes size={24} />
        </button>

        {/* Top Logo */}
        <div className="flex justify-center items-center py-6 px-4 border-b border-gray-700">
          <Image
            src="/logo.png" // Ensure this path is correct
            alt="Company Logo"
            width={150} // Slightly larger
            height={50} // Adjust height proportionally
            priority // For better loading performance on initial render
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col py-6 px-12 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.label === "Log Out") {
              return (
                <button
                  key="logout"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-700 hover:text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 mt-auto group" // Push to bottom, changed color for logout
                  aria-label="Log out of the system"
                >
                  <FaSignOutAlt
                    className="text-red-300 group-hover:text-white transition-colors duration-200"
                    size={18}
                  />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium",
                  "transition-all duration-200 ease-in-out",
                  isActive
                    ? "bg-purple-600 text-white shadow-md transform translate-x-1" // Active state with slight translation
                    : "text-gray-300 hover:bg-gray-700 hover:text-white" // Text color for non-active items
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        {/* Navbar (Header) */}
        <header className="w-full bg-white shadow-lg p-4 sm:p-6 flex items-center justify-between z-40 border-b border-gray-100">
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden text-gray-600 hover:text-purple-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <FaBars size={28} />
            </button>

            {/* Search Input */}
            <div className="relative flex items-center w-full max-w-sm lg:max-w-md">
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm md:text-base transition-all duration-200 shadow-sm"
                aria-label="Search input"
              />
              <FaSearch className="absolute left-3 text-gray-400" size={18} />
            </div>
          </div>

          {/* Notification and Profile */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              className="relative text-gray-600 hover:text-purple-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Notifications"
            >
              <FaBell size={24} />
              {/* Notification badge - without animation */}
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center space-x-3 cursor-pointer group">
              <Image
                src="/profile.png" // Ensure this path is correct
                alt="User Profile"
                width={44} // Slightly larger profile image
                height={44}
                className="rounded-full object-cover border-2 border-purple-300 group-hover:border-purple-500 transition-colors duration-200 shadow-md"
              />
              <div className="leading-tight hidden sm:block">
                {" "}
                {/* Hide name on very small screens */}
                <p className="text-purple-700 font-semibold text-base group-hover:text-purple-900 transition-colors duration-200">
                  Rashidatul Kobra
                </p>
                <p className="text-sm text-gray-600">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
