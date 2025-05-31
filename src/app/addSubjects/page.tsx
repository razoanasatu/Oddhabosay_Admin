"use client";
import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

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
    try {
      const response = await fetch(`${baseUrl}/api/subjects`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      } else {
        setError("Failed to fetch subjects");
      }
    } catch (err) {
      setError("Error fetching subjects");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!formData.name.trim()) {
      setError("Subject name is required");
      return;
    }

    setLoading(true);
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
        setError("");
      } else {
        setError("Failed to create subject");
      }
    } catch (err) {
      setError("Error creating subject");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async () => {
    if (!formData.name.trim()) {
      setError("Subject name is required");
      return;
    }

    setLoading(true);
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
        setError("");
      } else {
        setError("Failed to update subject");
      }
    } catch (err) {
      setError("Error updating subject");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async () => {
    setLoading(true);
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
        setError("");
      } else {
        setError("Failed to delete subject");
      }
    } catch (err) {
      setError("Error deleting subject");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Subject Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Subjects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading subjects...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No subjects found
                  </td>
                </tr>
              ) : (
                subjects.map((subject: Subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.questions ? subject.questions.length : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit Subject"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(subject)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Subject
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createSubject}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Subject
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateSubject}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Subject
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete the subject &quot;
                  {selectedSubject?.name}&quot;? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={deleteSubject}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
