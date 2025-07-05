"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "../../components/AdminLayout";
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie("token"); // 🔄 changed from "authToken" to "token"
      const user = getCookie("user");

      const isAuthPage = pathname === "/signIn" || pathname === "/signUp";

      if (token && user) {
        setIsAuthenticated(true);
        if (isAuthPage) {
          router.push("/"); // Redirect authenticated users away from sign-in/up
        }
      } else {
        setIsAuthenticated(false);
        if (!isAuthPage) {
          router.push("/signIn"); // Redirect unauthenticated users
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Public pages: don't wrap in AdminLayout, but still include ToastContainer
  if (pathname === "/signIn" || pathname === "/signUp") {
    return (
      <>
        {children}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    );
  }

  // Authenticated pages: wrap in AdminLayout
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
