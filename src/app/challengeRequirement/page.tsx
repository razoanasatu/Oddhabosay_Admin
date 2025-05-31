"use client";

import { baseUrl } from "@/utils/constant";
import { useState } from "react";

export default function AddChallengeRequirement() {
  // State for all fields
  const [formData, setFormData] = useState({
    number_of_practice_challenges: 5,
    number_of_weekly_challenges: 3,
    number_of_monthly_challenges: 2,
    number_of_mega_challenges: 1,
    number_of_special_event_challenges: 1,
    number_of_practice_questions_solved: 100,
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value), // convert to number
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting payload:", formData);

    try {
      const res = await fetch(`${baseUrl}/api/challenge-requirement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Challenge requirements added successfully");
      } else {
        alert("Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      <h1 className="text-black text-xl font-bold mb-6">
        Add Challenge Requirements
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200"
      >
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 capitalize">
              {key.replace(/_/g, " ")}
            </label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleChange}
              min={0}
              className="border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-sm px-8 py-2 transition self-start"
        >
          Save
        </button>
      </form>
    </div>
  );
}
