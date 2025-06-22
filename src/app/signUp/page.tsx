"use client";

import { baseUrl } from "@/utils/constant";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_no: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { full_name, email, phone_no, password } = formData;

    // Client-side validation
    if (!full_name || !email || !phone_no || !password) {
      setError("All fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Failed to sign up.");
        setLoading(false);
        return;
      }

      // Success: redirect to signin
      router.push("/signin");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          className="w-full p-2 border rounded mb-4"
          value={formData.full_name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone_no"
          placeholder="Phone Number"
          className="w-full p-2 border rounded mb-4"
          value={formData.phone_no}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={formData.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded mb-4"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Below Sign Up button */}
        <p className="text-center text-sm text-gray-700">
          Already have an Account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/signin")}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}
