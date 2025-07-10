"use client";
import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is already installed and configured

// Define Subject type properly
type Question = {
  id: string;
  // Add other fields if needed
};

type Subject = {
  id: string;
  name: string;
  questions?: Question[];
};

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/subjects`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      } else {
        setError(data.message || "Failed to fetch subjects");
        toast.error(data.message || "Failed to fetch subjects");
      }
    } catch (err) {
      setError("Error fetching subjects. Please try again.");
      toast.error("Error fetching subjects. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!formData.name.trim()) {
      setError("Subject name is required");
      toast.error("Subject name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setShowCreateModal(false);
        setFormData({ name: "" });
        fetchSubjects();
        toast.success("Subject created successfully!");
      } else {
        setError(data.message || "Failed to create subject");
        toast.error(data.message || "Failed to create subject");
      }
    } catch (err) {
      setError("Error creating subject. Please try again.");
      toast.error("Error creating subject. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async () => {
    if (!formData.name.trim()) {
      setError("Subject name is required");
      toast.error("Subject name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${baseUrl}/api/subjects/${selectedSubject?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success || response.ok) {
        setShowEditModal(false);
        setSelectedSubject(null);
        setFormData({ name: "" });
        fetchSubjects();
        toast.success("Subject updated successfully!");
      } else {
        setError(data.message || "Failed to update subject");
        toast.error(data.message || "Failed to update subject");
      }
    } catch (err) {
      setError("Error updating subject. Please try again.");
      toast.error("Error updating subject. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${baseUrl}/api/subjects/${selectedSubject?.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedSubject(null);
        fetchSubjects();
        toast.success("Subject deleted successfully!");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete subject");
        toast.error(data.message || "Failed to delete subject");
      }
    } catch (err) {
      setError("Error deleting subject. Please try again.");
      toast.error("Error deleting subject. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({ name: subject.name });
    setShowEditModal(true);
    setError("");
  };

  const handleDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
    setError("");
  };

  const handleCreate = () => {
    setFormData({ name: "" });
    setShowCreateModal(true);
    setError("");
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0">
            Subject Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus size={22} strokeWidth={2.5} />
            Add New Subject
          </button>
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

        {/* Subjects Table */}
        {/* <div className="bg-white rounded-sm shadow-lg overflow-hidden border border-gray-100"> */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                Subject Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                Questions Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-purple-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
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
                    Loading subjects...
                  </div>
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-500 italic"
                >
                  No subjects found. Click "Add New Subject" to create one.
                </td>
              </tr>
            ) : (
              subjects.map((subject: Subject) => (
                <tr
                  key={subject.id}
                  className="hover:bg-purple-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800 font-semibold">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {subject.questions ? subject.questions.length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-all duration-200 transform hover:scale-110 shadow-sm"
                        title="Edit Subject"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full bg-red-50 hover:bg-red-100 transition-all duration-200 transform hover:scale-110 shadow-sm"
                        title="Delete Subject"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* </div> */}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close create subject modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Create New Subject
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="subject-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject Name
                </label>
                <input
                  type="text"
                  id="subject-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., Mathematics, Physics, History"
                  aria-required="true"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createSubject}
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
                  ) : (
                    "Create Subject"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close edit subject modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Edit Subject
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="edit-subject-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject Name
                </label>
                <input
                  type="text"
                  id="edit-subject-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="Enter new subject name"
                  aria-required="true"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSubject}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
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
                  ) : (
                    "Update Subject"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close delete subject modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Delete Subject
              </h2>

              <p className="text-gray-700 mb-8 leading-relaxed">
                Are you sure you want to delete the subject "
                <span className="font-semibold text-purple-800">
                  {selectedSubject?.name}
                </span>
                "? This action cannot be undone, and all associated questions
                will also be removed.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  No, Cancel
                </button>
                <button
                  onClick={deleteSubject}
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
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
                  ) : (
                    "Yes, Delete"
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

export default SubjectManagement;
