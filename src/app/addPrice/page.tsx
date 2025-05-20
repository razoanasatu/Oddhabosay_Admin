"use client";

import { useState } from "react";

export default function AddPriceList() {
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [upToUser, setUpToUser] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can handle form submission here
    console.log({ category, price, upToUser, description });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Create Challenge
        </h1>
        <button
          onClick={() => alert("Challenge created!")}
          className="mt-4 md:mt-0 px-4 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition"
          type="button"
        >
          Create Challenge
        </button>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200"
      >
        {/* Select Challenge Category */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="category" className="mb-1 font-medium">
            Select Challenge Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            required
          >
            <option value="" disabled>
              -- Select a category --
            </option>
            <option value="fitness">Fitness</option>
            <option value="education">Education</option>
            <option value="coding">Coding</option>
            <option value="art">Art</option>
          </select>
        </div>

        {/* Price */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="price" className="mb-1 font-medium">
            Price
          </label>
          <input
            type="text"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
          />
        </div>

        {/* Up to User */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Up to User
          </label>
          <input
            type="text"
            placeholder="Top 10 up to User 100"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="description" className="mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description about the challenge."
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
            Submit Challenge
          </button>
        </div>
      </form>
    </div>
  );
}
