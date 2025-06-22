"use client";

import { baseUrl } from "@/utils/constant";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies"; // 👈 import nookies
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/admins/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error response:", data);
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ✅ Set token and user cookies using nookies
      setCookie(null, "token", data.data.token, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      setCookie(null, "user", JSON.stringify(data.data.user), {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      // Redirect to home page
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mb-4"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-700">
          Don&apos;t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/signUp")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
