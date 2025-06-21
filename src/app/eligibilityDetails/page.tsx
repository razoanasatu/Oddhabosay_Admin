"use client";

import { baseUrl } from "@/utils/constant";
import React, { useEffect, useState } from "react";

interface Eligibility {
  id?: number;
  year: number;
  practice_questions: number;
  weekly: number;
  monthly: number;
  mega: number;
  special_event: number;
  practice: number;
  isEligible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const EligibilityDetails: React.FC = () => {
  const year = new Date().getFullYear();
  const [form, setForm] = useState<Eligibility>({
    year,
    practice_questions: 0,
    weekly: 0,
    monthly: 0,
    mega: 0,
    special_event: 0,
    practice: 0,
    isEligible: false,
  });

  const [data, setData] = useState<Eligibility | null>(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/win-laptop-eligibility/${year}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setForm(json.data);
          setData(json.data);
        }
      });
  }, [year]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : +value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${baseUrl}/api/win-laptop-eligibility/${year}`, {
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
        🏆 Win a Laptop Eligibility ({year})
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {Object.entries(form).map(([key, value]) =>
          key !== "isEligible" && key !== "year" ? (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-600 dark:text-gray-300 capitalize mb-1">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="number"
                name={key}
                value={value as number}
                onChange={handleChange}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${key.replace(/_/g, " ")}`}
              />
            </div>
          ) : null
        )}

        <div className="md:col-span-2 flex items-center space-x-3 mt-2">
          <input
            type="checkbox"
            name="isEligible"
            checked={form.isEligible}
            onChange={handleChange}
            id="isEligible"
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="isEligible"
            className="text-sm text-gray-700 dark:text-gray-200 font-medium"
          >
            Mark as Eligible for Laptop
          </label>
        </div>

        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-blue-700 hover:to-purple-600 transition-all text-lg font-medium"
          >
            Save Eligibility
          </button>
        </div>
      </form>

      {data && (
        <div className="mt-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            📋 Eligibility Summary (Year {data.year})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm text-gray-700 dark:text-gray-200">
            <div>
              <span className="font-medium">Practice Questions:</span>{" "}
              {data.practice_questions}
            </div>
            <div>
              <span className="font-medium">Weekly Challenges:</span>{" "}
              {data.weekly}
            </div>
            <div>
              <span className="font-medium">Monthly Challenges:</span>{" "}
              {data.monthly}
            </div>
            <div>
              <span className="font-medium">Mega Challenges:</span> {data.mega}
            </div>
            <div>
              <span className="font-medium">Special Events:</span>{" "}
              {data.special_event}
            </div>
            <div>
              <span className="font-medium">Practice Completed:</span>{" "}
              {data.practice}
            </div>
            <div>
              <span className="font-medium">Eligibility:</span>{" "}
              <span
                className={`font-semibold ${
                  data.isEligible ? "text-green-600" : "text-red-500"
                }`}
              >
                {data.isEligible ? "Eligible ✅" : "Not Eligible ❌"}
              </span>
            </div>
            <div>
              <span className="font-medium">Created At:</span>{" "}
              {new Date(data.createdAt || "").toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated At:</span>{" "}
              {new Date(data.updatedAt || "").toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityDetails;
