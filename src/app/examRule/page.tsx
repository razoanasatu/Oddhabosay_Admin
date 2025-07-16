"use client";

import { baseUrl } from "@/utils/constant";
import { Edit, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is already installed and configured

// Define types
type ExamRule = {
  id: string;
  title: string;
  details: string;
  rules: string[]; // Array of strings for rules
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
};

const ExamRuleManagement = () => {
  const [examRule, setExamRule] = useState<ExamRule | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    rules: "", // Storing rules as a single string, each line being a rule
    linkUrl: "",
    isActive: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the single exam rule
  const fetchExamRule = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/exam-rules`);
      const data = await response.json();
      if (data.success && data.data) {
        setExamRule(data.data);
        // Pre-fill form data if a rule is found, useful for initial display or re-editing
        setFormData({
          title: data.data.title,
          details: data.data.details,
          rules: data.data.rules ? data.data.rules.join("\n") : "",
          linkUrl: data.data.linkUrl || "",
          isActive: data.data.isActive,
        });
        setImagePreview(data.data.imageUrl);
      } else if (!data.data) {
        setExamRule(null); // No rule found
        setFormData({
          title: "",
          details: "",
          rules: "",
          linkUrl: "",
          isActive: false,
        });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setError(data.message || "Failed to fetch exam rule");
        toast.error(data.message || "Failed to fetch exam rule");
      }
    } catch (err) {
      setError("Error fetching exam rule. Please try again.");
      toast.error("Error fetching exam rule. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedImage(null);
      setImagePreview(examRule?.imageUrl || null); // Revert to existing image if cleared
    }
  };

  // Open modal for create or edit
  const handleOpenFormModal = (isEditMode: boolean) => {
    setIsEditing(isEditMode);
    setError("");
    if (isEditMode && examRule) {
      setFormData({
        title: examRule.title,
        details: examRule.details,
        rules: examRule.rules ? examRule.rules.join("\n") : "",
        linkUrl: examRule.linkUrl || "",
        isActive: examRule.isActive,
      });
      setImagePreview(examRule.imageUrl);
    } else {
      setFormData({
        title: "",
        details: "",
        rules: "",
        linkUrl: "",
        isActive: false,
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
    setShowFormModal(true);
  };

  // Submit handler for create/update
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.details.trim()) {
      setError("Title and details are required.");
      toast.error("Title and details are required.");
      return;
    }

    setLoading(true);
    setError("");

    const rulesArray = formData.rules
      .split("\n")
      .map((rule) => rule.trim())
      .filter((rule) => rule !== "");

    try {
      let response;
      if (isEditing) {
        // This is the "DELETE" API acting as an update as per user's specification.
        // It's highly unusual for a DELETE method to carry a body and perform an update.
        console.warn(
          "Using DELETE method for update as per API specification. This is an unconventional REST practice."
        );
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("details", formData.details);
        formDataToSend.append("linkUrl", formData.linkUrl);
        formDataToSend.append("isActive", formData.isActive.toString());
        rulesArray.forEach((rule) => {
          formDataToSend.append("rules[]", rule); // Append each rule as 'rules[]'
        });
        if (selectedImage) {
          formDataToSend.append("image", selectedImage);
        }

        response = await fetch(`${baseUrl}/api/exam-rules`, {
          method: "DELETE", // Using DELETE method as specified by user for update
          body: formDataToSend,
        });

        if (response.ok) {
          toast.success("Exam rule updated successfully!");
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update exam rule");
          toast.error(data.message || "Failed to update exam rule");
        }
      } else {
        // Create new exam rule
        if (selectedImage) {
          // POST with image (form-data)
          const formDataToSend = new FormData();
          formDataToSend.append("title", formData.title);
          formDataToSend.append("details", formData.details);
          formDataToSend.append("linkUrl", formData.linkUrl);
          formDataToSend.append("isActive", formData.isActive.toString());
          rulesArray.forEach((rule) => {
            formDataToSend.append("rules[]", rule);
          });
          formDataToSend.append("image", selectedImage);

          response = await fetch(`${baseUrl}/api/exam-rules`, {
            method: "POST",
            body: formDataToSend,
          });
        } else {
          // POST without image (JSON)
          response = await fetch(`${baseUrl}/api/exam-rules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              details: formData.details,
              rules: rulesArray,
              linkUrl: formData.linkUrl,
              isActive: formData.isActive,
            }),
          });
        }

        const data = await response.json();
        if (data.success || response.ok) {
          toast.success("Exam rule created successfully!");
        } else {
          setError(data.message || "Failed to create exam rule");
          toast.error(data.message || "Failed to create exam rule");
        }
      }

      if (response.ok || response.status === 200) {
        setShowFormModal(false);
        fetchExamRule(); // Re-fetch to update UI
      }
    } catch (err) {
      setError("Error processing request. Please try again.");
      toast.error("Error processing request. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamRule();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0">
            Exam Rule Management
          </h1>
          {examRule ? (
            <button
              onClick={() => handleOpenFormModal(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Edit size={22} strokeWidth={2.5} />
              Edit Exam Rule
            </button>
          ) : (
            <button
              onClick={() => handleOpenFormModal(false)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus size={22} strokeWidth={2.5} />
              Create New Exam Rule
            </button>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg mb-6 flex items-center shadow-md animate-fade-in"
            role="alert"
          >
            <X className="h-5 w-5 mr-3" />
            <div>
              <p className="font-semibold">Error!</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Exam Rule Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <svg
              className="animate-spin h-7 w-7 mr-3 text-purple-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading exam rule...
          </div>
        ) : examRule ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold text-purple-800">
                {examRule.title}
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {examRule.details}
              </p>
              {examRule.rules && examRule.rules.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg shadow-inner">
                  <h3 className="text-xl font-semibold text-purple-700 mb-3">
                    Rules:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {examRule.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
              {examRule.linkUrl && (
                <div className="mt-4">
                  <span className="font-semibold text-purple-700">
                    Useful Link:{" "}
                  </span>
                  <a
                    href={examRule.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {examRule.linkUrl}
                  </a>
                </div>
              )}
              <div className="mt-4">
                <span className="font-semibold text-purple-700">Status: </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    examRule.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {examRule.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            {examRule.imageUrl && (
              <div className="flex justify-center items-start">
                <img
                  src={examRule.imageUrl}
                  alt={examRule.title}
                  className="rounded-xl shadow-lg max-w-full h-auto object-cover max-h-96"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 italic">
            No exam rules configured yet. Click "Create New Exam Rule" to set
            them up.
          </div>
        )}

        {/* Create/Edit Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Modal content container with max-height and flex column for internal layout */}
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-scale-in">
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {/* Modal Header */}
              <div className="p-6 pb-3 border-b border-purple-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-purple-900">
                  {isEditing ? "Edit Exam Rule" : "Create New Exam Rule"}
                </h2>
              </div>

              {/* Modal Body - Scrollable Area */}
              <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                      placeholder="e.g., General Exam Rules"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="linkUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Link URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="linkUrl"
                      name="linkUrl"
                      value={formData.linkUrl}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                      placeholder="e.g., https://example.com/exam-guide"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="details"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Details / Description
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    value={formData.details}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm resize-y"
                    placeholder="e.g., These rules apply to all examinations held this semester."
                    aria-required="true"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="rules"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Specific Rules (One rule per line)
                  </label>
                  <textarea
                    id="rules"
                    name="rules"
                    value={formData.rules}
                    onChange={handleFormChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm resize-y"
                    placeholder="e.g.,
1. Cheating is strictly prohibited.
2. Mobile phones are not allowed during the exam.
3. Arrive 15 minutes before exam starts."
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Image (Optional)
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-gray-800 text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:transition-all file:duration-200"
                  />
                  {imagePreview && (
                    <div className="mt-4 w-32 h-32 relative group">
                      <img
                        src={imagePreview}
                        alt="Image Preview"
                        className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          // Optionally reset the file input visually
                          const fileInput = document.getElementById(
                            "image"
                          ) as HTMLInputElement;
                          if (fileInput) fileInput.value = "";
                        }}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-8 flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-base text-gray-900 font-medium"
                  >
                    Is Active
                  </label>
                </div>
              </div>

              {/* Modal Footer - Fixed action buttons */}
              <div className="p-6 pt-4 border-t border-purple-200 flex-shrink-0 flex justify-end gap-3">
                <button
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : isEditing ? (
                    "Update Exam Rule"
                  ) : (
                    "Create Exam Rule"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamRuleManagement;
