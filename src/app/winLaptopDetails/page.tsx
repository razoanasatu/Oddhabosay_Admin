"use client";

import { baseUrl } from "@/utils/constant";
import React, { useEffect, useState } from "react";

interface LaptopDetail {
  id: number;
  title: string;
  content: string;
  message_to_winner: string;
  image: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

const WinLaptopDetails: React.FC = () => {
  const year = new Date().getFullYear();

  const [form, setForm] = useState<
    Omit<LaptopDetail, "id" | "createdAt" | "updatedAt">
  >({
    title: "",
    content: "",
    message_to_winner: "",
    image: "",
    year,
  });

  const [data, setData] = useState<LaptopDetail[]>([]);

  useEffect(() => {
    fetch(`${baseUrl}/api/win-laptop-details/?year=${year}`)
      .then((res) => res.json())
      .then((json) => setData(json.data || []));
  }, [year]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${baseUrl}/api/win-laptop-details/${year}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    alert(json.message);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        🎁 Win a Laptop Details ({year})
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {(
          [
            { name: "title", label: "Title" },
            { name: "content", label: "Content" },
            { name: "message_to_winner", label: "Message to Winner" },
            { name: "image", label: "Image URL" },
          ] as const
        ).map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label}
            </label>
            <input
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={`Enter ${label}`}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-3 px-6 mt-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all text-lg font-medium"
        >
          Save Laptop Details
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Saved Laptop Details
        </h3>
        <div className="space-y-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-40 h-40 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                />
                <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {item.content}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    🏆 Winner Message: {item.message_to_winner}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinLaptopDetails;
