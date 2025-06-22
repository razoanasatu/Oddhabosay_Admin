"use client";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { full_name, email, phone_no, password } = formData;

    // ✅ Client-side validation
    if (!full_name || !email || !phone_no || !password) {
      setError("All fields are required.");
      return;
    }

    // Simulate API signup (in a real app, post to an API route)
    console.log("User signed up:", formData);

    // Redirect to signin
    router.push("/signin");
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
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
