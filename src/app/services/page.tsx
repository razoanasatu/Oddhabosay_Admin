"use client";
import { baseUrl } from "@/utils/constant"; // Assuming baseUrl is correctly defined here
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is set up

// Type definition for Terms of Service data
type TermsOfServiceData = {
  id: number;
  title: string;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const TermsOfServiceManagement = () => {
  // State variables for managing Terms of Service data and UI
  const [termsOfServiceData, setTermsOfServiceData] =
    useState<TermsOfServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetches the Terms of Service content from the API.
   */
  const fetchTermsOfService = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/terms`);
      const data = await response.json();
      if (data.success && data.data && data.data.termsOfService) {
        setTermsOfServiceData(data.data.termsOfService);
        setTitle(data.data.termsOfService.title);
        setContent(data.data.termsOfService.content);
      } else {
        toast.error(
          data.message || "Failed to fetch Terms of Service content."
        );
        setError(data.message || "Failed to fetch Terms of Service content.");
      }
    } catch (err) {
      console.error("Error fetching Terms of Service:", err);
      toast.error("Error fetching Terms of Service content.");
      setError("Error fetching Terms of Service content.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Terms of Service content on component mount
  useEffect(() => {
    fetchTermsOfService();
  }, []);

  /**
   * Handles saving (updating) the Terms of Service content.
   * Uses POST method for both create and update as per API specification.
   */
  const handleSave = async () => {
    if (!title || !content) {
      toast.error("Title and Content cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${baseUrl}/api/terms`, {
        method: "POST", // Using POST for both create and update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        toast.success("Terms of Service content updated successfully.");
        fetchTermsOfService(); // Re-fetch to ensure the displayed data is fresh
      } else {
        const data = await response.json();
        toast.error(
          data.message || "Failed to update Terms of Service content."
        );
      }
    } catch (err) {
      console.error("Error updating Terms of Service:", err);
      toast.error("Error updating Terms of Service content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900">
            Terms of Service Management
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
            Loading Terms of Service content...
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="terms-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="terms-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                placeholder="Enter title for Terms of Service section"
              />
            </div>
            <div>
              <label
                htmlFor="terms-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Content
              </label>
              <textarea
                id="terms-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 resize-y"
                placeholder="Enter detailed content for Terms of Service section"
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

            {termsOfServiceData && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">
                  Current Terms of Service Content
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {termsOfServiceData.title}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {termsOfServiceData.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Last Updated:{" "}
                    {new Date(termsOfServiceData.updatedAt).toLocaleString()}
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

export default TermsOfServiceManagement;
