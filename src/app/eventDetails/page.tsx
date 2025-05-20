"use client";

import { useState } from "react";

export default function EventFormPage() {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Event Name</h1>
        <button className="mt-4 md:mt-0 px-4 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition">
          Create Special Events
        </button>
      </div>

      {/* Form Body */}
      <form className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200">
        {/* Event Name */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="eventName" className="mb-1 font-medium">
            Event Name
          </label>
          <input
            type="text"
            id="eventName"
            placeholder="Special Event 01"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
          />
        </div>

        {/* Time */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="time" className="mb-1 font-medium">
            Time
          </label>
          <input
            type="text"
            id="time"
            placeholder="10:00 AM"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="location" className="mb-1 font-medium">
            Location
          </label>
          <input
            type="text"
            id="location"
            placeholder="Bonani Dhaka"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
          />
        </div>

        {/* Banner Photo Card with fixed image link */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="mb-1 font-medium">Choose Banner (Photo)</label>
          <div className="p-3 rounded border border-gray-300 flex justify-center items-center h-40 bg-white">
            <img
              src="Event.png" // replace this with your actual image URL
              alt="Banner"
              className="max-h-full object-contain"
            />
          </div>
        </div>

        {/* Banner Description */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="mb-1 font-medium">
            Choose Banner (Description)
          </label>
          <textarea
            placeholder="Write a short description about your event banner, e.g., 'Exciting family-friendly activities and live music!'."
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            rows={4}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Submit Event
          </button>
        </div>
      </form>
    </div>
  );
}
