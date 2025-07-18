"use client";
import { baseUrl } from "@/utils/constant"; // Assuming baseUrl is correctly defined here
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is set up

// Type definition for About Us data
type AboutUsData = {
  id: number;
  title: string;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const AboutUsManagement = () => {
  // State variables for managing About Us data and UI
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetches the About Us content from the API.
   */
  const fetchAboutUs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/about-us`);
      const data = await response.json();
      if (data.success && data.data && data.data.aboutUs) {
        setAboutUsData(data.data.aboutUs);
        setTitle(data.data.aboutUs.title);
        setContent(data.data.aboutUs.content);
      } else {
        toast.error(data.message || "Failed to fetch About Us content.");
        setError(data.message || "Failed to fetch About Us content.");
      }
    } catch (err) {
      console.error("Error fetching About Us:", err);
      toast.error("Error fetching About Us content.");
      setError("Error fetching About Us content.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch About Us content on component mount
  useEffect(() => {
    fetchAboutUs();
  }, []);

  /**
   * Handles saving (updating) the About Us content.
   * Uses POST method as per clarification that it handles both create and update.
   */
  const handleSave = async () => {
    if (!title || !content) {
      toast.error("Title and Content cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${baseUrl}/api/about-us`, {
        method: "POST", // Changed from PUT to POST as per user's clarification
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        toast.success("About Us content updated successfully.");
        fetchAboutUs(); // Re-fetch to ensure the displayed data is fresh
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update About Us content.");
      }
    } catch (err) {
      console.error("Error updating About Us:", err);
      toast.error("Error updating About Us content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900">
            About Us Management
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg mb-6 flex items-center shadow-md animate-fade-in">
            <X className="h-5 w-5 mr-3" />
            <div>
              <p className="font-semibold">Error!</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-600">
            Loading About Us content...
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="about-us-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="about-us-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                placeholder="Enter title for About Us section"
              />
            </div>
            <div>
              <label
                htmlFor="about-us-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Content
              </label>
              <textarea
                id="about-us-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 resize-y"
                placeholder="Enter detailed content for About Us section"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {aboutUsData && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">
                  Current About Us Content
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {aboutUsData.title}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {aboutUsData.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Last Updated:{" "}
                    {new Date(aboutUsData.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsManagement;
