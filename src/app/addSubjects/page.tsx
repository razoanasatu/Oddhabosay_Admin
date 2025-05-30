"use client";
import { baseUrl } from "@/utils/constant";
import { useState } from "react";

export default function AddSubject() {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
    };

    console.log("Submitting payload:", payload);

    try {
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Subject added successfully");
      } else {
        alert("Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-black text-xl font-bold">Add Subject</h1>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            See All Weekly Challenges
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200"
      >
        {/* Subject Name */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter the question"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col w-full md:w-1/2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-sm px-8 py-2 transition self-start"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
