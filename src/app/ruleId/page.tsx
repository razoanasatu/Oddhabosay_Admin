"use client";

import { baseUrl } from "@/utils/constant";
import { useState } from "react";

export default function AddChallengeRule() {
  const [title, setTitle] = useState("Conduct Guidelines");
  const [points, setPoints] = useState([
    "No use of mobile phones",
    "Be respectful to other participants",
  ]);
  const [challengeType, setChallengeType] = useState("practice");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      points,
      challenge_type: challengeType,
    };

    console.log("Submitting:", payload);

    try {
      const res = await fetch(`${baseUrl}/api/challenge-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Challenge rule added successfully");
      } else {
        alert("Failed to add challenge rule.");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-black">Add Challenge Rule</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md pt-4 px-8 pb-4 space-y-4 w-full md:w-3/4 border border-purple-200"
      >
        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mt-1"
            required
          />
        </div>

        {/* Points */}
        <div className="flex flex-col">
          <label htmlFor="points" className="text-sm font-medium text-gray-700">
            Points (one per line)
          </label>
          <textarea
            id="points"
            rows={4}
            value={points.join("\n")}
            onChange={(e) => setPoints(e.target.value.split("\n"))}
            className="border border-gray-300 rounded-md p-2 mt-1"
            required
          />
        </div>

        {/* Challenge Type */}
        <div className="flex flex-col">
          <label
            htmlFor="challengeType"
            className="text-sm font-medium text-gray-700"
          >
            Challenge Type
          </label>
          <input
            id="challengeType"
            type="text"
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value)}
            className="border border-gray-300 rounded-md p-2 mt-1"
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-sm px-8 py-2 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
