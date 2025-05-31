"use client";
import { baseUrl } from "@/utils/constant";
import { useState } from "react";

export default function AddSpecialEvent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);

    try {
      const res = await fetch(`${baseUrl}/api/special-event`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Special event added successfully.");
        setTitle("");
        setContent("");
        setImage(null);
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
        <h1 className="text-black text-xl font-bold">Add Special Event</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200"
        encType="multipart/form-data"
      >
        {/* Image Upload */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content"
            rows={4}
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
