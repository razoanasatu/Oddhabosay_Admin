"use client";
import { baseUrl } from "@/utils/constant"; // Assuming baseUrl is correctly defined here
import { Edit, Plus, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is set up

// Type definition for Breaking News entry
type BreakingNews = {
  id: number;
  title: string;
  content: string;
  active_status: boolean;
  publishedAt: string; // Assuming this is a string date from the API
};

const BreakingNewsManagement = () => {
  // State variables for managing breaking news data and UI
  const [breakingNewsList, setBreakingNewsList] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedBreakingNews, setSelectedBreakingNews] =
    useState<BreakingNews | null>(null);

  // State variables for form inputs in modals
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeStatus, setActiveStatus] = useState(true); // Default to true for new entries
  const [isSaving, setIsSaving] = useState(false); // For add/edit save button loading state

  /**
   * Fetches the list of breaking news entries from the API.
   */
  const fetchBreakingNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/breaking-news`);
      const data = await response.json();
      if (data.success) {
        // Sort by publishedAt in descending order (latest first)
        const sortedData = data.data.sort(
          (a: BreakingNews, b: BreakingNews) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
        setBreakingNewsList(sortedData);
      } else {
        toast.error(data.message || "Failed to fetch breaking news entries.");
        setError(data.message || "Failed to fetch breaking news entries.");
      }
    } catch (err) {
      console.error("Error fetching breaking news:", err);
      toast.error("Error fetching breaking news entries.");
      setError("Error fetching breaking news entries.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch breaking news entries on component mount
  useEffect(() => {
    fetchBreakingNews();
  }, []);

  /**
   * Handles opening the Add New Breaking News modal.
   * Resets form fields.
   */
  const handleAddClick = () => {
    setTitle("");
    setContent("");
    setActiveStatus(true); // Default for new entries
    setShowAddModal(true);
  };

  /**
   * Handles submitting the form to add a new breaking news entry.
   */
  const handleAddBreakingNews = async () => {
    if (!title || !content) {
      toast.error("Please fill in all required fields (Title, Content).");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${baseUrl}/api/breaking-news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, active_status: activeStatus }),
      });

      if (response.ok) {
        toast.success("Breaking news entry added successfully.");
        fetchBreakingNews(); // Refresh the list
        setShowAddModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to add breaking news entry.");
      }
    } catch (err) {
      console.error("Error adding breaking news:", err);
      toast.error("Error adding breaking news entry.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles opening the Edit Breaking News modal.
   * Populates form fields with selected breaking news data.
   * @param news The breaking news object to edit.
   */
  const handleEditClick = (news: BreakingNews) => {
    setSelectedBreakingNews(news);
    setTitle(news.title);
    setContent(news.content);
    setActiveStatus(news.active_status);
    setShowEditModal(true);
  };

  /**
   * Handles submitting the form to update an existing breaking news entry.
   */
  const handleUpdateBreakingNews = async () => {
    if (!selectedBreakingNews) return;
    if (!title || !content) {
      toast.error("Please fill in all required fields (Title, Content).");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${baseUrl}/api/breaking-news/${selectedBreakingNews.id}`,
        {
          method: "PUT", // Use PUT for updates as per your API
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, content, active_status: activeStatus }),
        }
      );

      if (response.ok) {
        toast.success("Breaking news entry updated successfully.");
        fetchBreakingNews(); // Refresh the list
        setShowEditModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update breaking news entry.");
      }
    } catch (err) {
      console.error("Error updating breaking news:", err);
      toast.error("Error updating breaking news entry.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles opening the Delete Confirmation modal.
   * @param news The breaking news object to delete.
   */
  const handleDeleteClick = (news: BreakingNews) => {
    setSelectedBreakingNews(news);
    setShowDeleteConfirmModal(true);
  };

  /**
   * Handles confirming and executing the deletion of a breaking news entry.
   */
  const handleDeleteBreakingNews = async () => {
    if (!selectedBreakingNews) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/breaking-news/${selectedBreakingNews.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          // As per your API, DELETE expects a body. Adjust userId and message as needed.
          // For a real application, userId might come from authentication context.
          body: JSON.stringify({
            userId: 1,
            message: "Deleting breaking news",
          }),
        }
      );

      if (response.ok) {
        toast.success("Breaking news entry deleted successfully.");
        fetchBreakingNews(); // Refresh the list
        setShowDeleteConfirmModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete breaking news entry.");
      }
    } catch (err) {
      console.error("Error deleting breaking news:", err);
      toast.error("Error deleting breaking news entry.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900">
            Breaking News Management
          </h1>
          <button
            onClick={handleAddClick}
            className="flex items-center px-6 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800 transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={20} className="mr-2" />
            Add New
          </button>
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

        {/* Breaking News List Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Published At
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Loading breaking news entries...
                  </td>
                </tr>
              ) : breakingNewsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No breaking news entries found.
                  </td>
                </tr>
              ) : (
                breakingNewsList.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {entry.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {entry.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">
                      {entry.content}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          entry.active_status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.active_status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(entry.publishedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full bg-red-50 hover:bg-red-100 transition-all duration-200"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add New Breaking News Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Add New Breaking News
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="add-title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="add-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                    placeholder="e.g., Important Announcement"
                  />
                </div>
                <div>
                  <label
                    htmlFor="add-content"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Content
                  </label>
                  <textarea
                    id="add-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 resize-y"
                    placeholder="Enter news content"
                  ></textarea>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="add-active-status"
                    checked={activeStatus}
                    onChange={(e) => setActiveStatus(e.target.checked)}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="add-active-status"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active Status
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBreakingNews}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Adding..." : "Add Breaking News"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Breaking News Modal */}
        {showEditModal && selectedBreakingNews && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Edit Breaking News #{selectedBreakingNews.id}
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-content"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Content
                  </label>
                  <textarea
                    id="edit-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800 resize-y"
                  ></textarea>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-active-status"
                    checked={activeStatus}
                    onChange={(e) => setActiveStatus(e.target.checked)}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="edit-active-status"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active Status
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBreakingNews}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Updating..." : "Update Breaking News"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && selectedBreakingNews && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the breaking news entry "
                <span className="font-semibold">
                  {selectedBreakingNews.title}
                </span>
                "? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBreakingNews}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakingNewsManagement;
