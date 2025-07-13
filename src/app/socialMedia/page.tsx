"use client";
import { baseUrl } from "@/utils/constant"; // Assuming baseUrl is correctly defined here
import { Edit, Plus, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is set up

// Type definitions for Social Media entry
type SocialMedia = {
  id: number;
  title: string;
  Link: string; // Changed from 'link' to 'Link' to match API response
  icon: string | null; // URL of the icon image
};

const SocialMediaManagement = () => {
  // State variables for managing social media data and UI
  const [socialMediaList, setSocialMediaList] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedSocialMedia, setSelectedSocialMedia] =
    useState<SocialMedia | null>(null);

  // State variables for form inputs in modals
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);

  /**
   * Fetches the list of social media entries from the API.
   */
  const fetchSocialMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/social-media`);
      const data = await response.json();
      if (data.success) {
        setSocialMediaList(data.data);
      } else {
        toast.error(data.message || "Failed to fetch social media entries.");
        setError(data.message || "Failed to fetch social media entries.");
      }
    } catch (err) {
      console.error("Error fetching social media:", err);
      toast.error("Error fetching social media entries.");
      setError("Error fetching social media entries.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch social media entries on component mount
  useEffect(() => {
    fetchSocialMedia();
  }, []);

  /**
   * Handles opening the Add New Social Media modal.
   * Resets form fields.
   */
  const handleAddClick = () => {
    setTitle("");
    setLink("");
    setIconFile(null);
    setShowAddModal(true);
  };

  /**
   * Handles submitting the form to add a new social media entry.
   */
  const handleAddSocialMedia = async () => {
    if (!title || !link || !iconFile) {
      toast.error("Please fill in all required fields (Title, Link, Icon).");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("Link", link); // Ensure this matches the backend's expected field name
    formData.append("icon", iconFile);

    try {
      const response = await fetch(`${baseUrl}/api/social-media`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Social media entry added successfully.");
        fetchSocialMedia(); // Refresh the list
        setShowAddModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to add social media entry.");
      }
    } catch (err) {
      console.error("Error adding social media:", err);
      toast.error("Error adding social media entry.");
    }
  };

  /**
   * Handles opening the Edit Social Media modal.
   * Populates form fields with selected social media data.
   * @param socialMedia The social media object to edit.
   */
  const handleEditClick = (socialMedia: SocialMedia) => {
    setSelectedSocialMedia(socialMedia);
    setTitle(socialMedia.title);
    setLink(socialMedia.Link);
    setIconFile(null); // Clear file input for new selection
    setShowEditModal(true);
  };

  /**
   * Handles submitting the form to update an existing social media entry.
   */
  const handleUpdateSocialMedia = async () => {
    if (!selectedSocialMedia) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("Link", link);
    if (iconFile) {
      formData.append("icon", iconFile); // Only append if a new file is selected
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/social-media/${selectedSocialMedia.id}`,
        {
          method: "PUT", // Use PUT for updates
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Social media entry updated successfully.");
        fetchSocialMedia(); // Refresh the list
        setShowEditModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update social media entry.");
      }
    } catch (err) {
      console.error("Error updating social media:", err);
      toast.error("Error updating social media entry.");
    }
  };

  /**
   * Handles opening the Delete Confirmation modal.
   * @param socialMedia The social media object to delete.
   */
  const handleDeleteClick = (socialMedia: SocialMedia) => {
    setSelectedSocialMedia(socialMedia);
    setShowDeleteConfirmModal(true);
  };

  /**
   * Handles confirming and executing the deletion of a social media entry.
   */
  const handleDeleteSocialMedia = async () => {
    if (!selectedSocialMedia) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/social-media/${selectedSocialMedia.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Social media entry deleted successfully.");
        fetchSocialMedia(); // Refresh the list
        setShowDeleteConfirmModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete social media entry.");
      }
    } catch (err) {
      console.error("Error deleting social media:", err);
      toast.error("Error deleting social media entry.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900">
            Social Media Management
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

        {/* Social Media List Table */}
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
                  Link
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Icon
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
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Loading social media entries...
                  </td>
                </tr>
              ) : socialMediaList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No social media entries found.
                  </td>
                </tr>
              ) : (
                socialMediaList.map((entry) => (
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
                    <td className="px-4 py-3 text-sm text-blue-600 hover:underline">
                      <a
                        href={entry.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {entry.Link}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {entry.icon ? (
                        <img
                          src={entry.icon}
                          alt={`${entry.title} Icon`}
                          className="w-10 h-10 object-contain rounded-md shadow-sm"
                          onError={(e) => {
                            e.currentTarget.onerror = null; // Prevent infinite loop
                            e.currentTarget.src = `https://placehold.co/40x40/E0E7FF/6B46C1?text=No+Img`; // Placeholder
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Icon</span>
                      )}
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

        {/* Add New Social Media Modal */}
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
                Add New Social Media
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
                    placeholder="e.g., Facebook, YouTube"
                  />
                </div>
                <div>
                  <label
                    htmlFor="add-link"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Link
                  </label>
                  <input
                    type="url"
                    id="add-link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                    placeholder="e.g., https://facebook.com/yourprofile"
                  />
                </div>
                <div>
                  <label
                    htmlFor="add-icon"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Icon Image
                  </label>
                  <input
                    type="file"
                    id="add-icon"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
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
                  onClick={handleAddSocialMedia}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
                >
                  Add Social Media
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Social Media Modal */}
        {showEditModal && selectedSocialMedia && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Edit Social Media #{selectedSocialMedia.id}
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
                    htmlFor="edit-link"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Link
                  </label>
                  <input
                    type="url"
                    id="edit-link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-icon"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Icon Image (Leave blank to keep current)
                  </label>
                  {selectedSocialMedia.icon && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Current Icon:
                      </p>
                      <img
                        src={selectedSocialMedia.icon}
                        alt="Current Icon"
                        className="w-16 h-16 object-contain rounded-md shadow-sm border border-gray-200"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="edit-icon"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
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
                  onClick={handleUpdateSocialMedia}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
                >
                  Update Social Media
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && selectedSocialMedia && (
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
                Are you sure you want to delete the social media entry "
                <span className="font-semibold">
                  {selectedSocialMedia.title}
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
                  onClick={handleDeleteSocialMedia}
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

export default SocialMediaManagement;
