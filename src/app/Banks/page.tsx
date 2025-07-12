"use client";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { baseUrl } from "@/utils/constant";
// Define the Bank type based on the GET API response
type Bank = {
  id: string; // Assuming 'id' can be string or number based on context, using string for consistency
  name: string;
  type: string;
  supported_methods: string[];
  active: boolean;
  image: string | null; // URL to the image, or null
  createdAt: string;
  updatedAt: string;
};

const BankInfoManagement = () => {
  // State variables for bank data and UI interactions
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    supportedMethods: "", // Comma-separated string for input
    imageFile: null as File | null, // For file input
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to fetch all bank information
  const fetchBanks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/bank`);
      const data = await response.json();
      if (data.success) {
        setBanks(data.data.banks); // Assuming 'banks' array is nested under 'data'
      } else {
        setError(data.message || "Failed to fetch banks.");
        toast.error(data.message || "Failed to fetch banks.");
      }
    } catch (err) {
      setError("Error fetching banks. Please try again.");
      toast.error("Error fetching banks. Please try again.");
      console.error("Error fetching banks:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch banks on component mount
  useEffect(() => {
    fetchBanks();
  }, []);

  // Handle input changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        imageFile: e.target.files![0], // Store the File object
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        imageFile: null,
      }));
    }
  };

  // Function to create new bank information
  const createBank = async () => {
    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.type.trim() ||
      !formData.supportedMethods.trim()
    ) {
      setError("All fields (Name, Type, Supported Methods) are required.");
      toast.error("All fields (Name, Type, Supported Methods) are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert the comma-separated string to an array
      const methodsArray = formData.supportedMethods
        .split(",")
        .map((method) => method.trim()) // Clean up extra spaces
        .filter((method) => method.length > 0); // Filter out empty strings

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("supported_methods", JSON.stringify(methodsArray)); // Send as JSON string

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      const response = await fetch(`${baseUrl}/api/bank/create`, {
        method: "POST",
        body: formDataToSend, // FormData handles Content-Type automatically for multipart/form-data
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          name: "",
          type: "",
          supportedMethods: "",
          imageFile: null,
        });
        fetchBanks(); // Refresh the list
        toast.success("Bank information posted successfully!");
      } else {
        setError(data.message || "Failed to post bank information.");
        toast.error(data.message || "Failed to post bank information.");
      }
    } catch (err) {
      setError("Error posting bank information. Please try again.");
      toast.error("Error posting bank information. Please try again.");
      console.error("Error posting bank info:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to update existing bank information
  const updateBank = async () => {
    if (!selectedBank?.id) {
      setError("No bank selected for update.");
      toast.error("No bank selected for update.");
      return;
    }
    if (
      !formData.name.trim() ||
      !formData.type.trim() ||
      !formData.supportedMethods.trim()
    ) {
      setError("All fields (Name, Type, Supported Methods) are required.");
      toast.error("All fields (Name, Type, Supported Methods) are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert the comma-separated string to an array
      const methodsArray = formData.supportedMethods
        .split(",")
        .map((method) => method.trim()) // Clean up extra spaces
        .filter((method) => method !== ""); // Filter out empty strings

      let response;
      if (formData.imageFile) {
        // If a new image file is selected, send as multipart/form-data
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("type", formData.type);
        formDataToSend.append(
          "supported_methods",
          JSON.stringify(methodsArray)
        ); // Send as JSON string
        formDataToSend.append("image", formData.imageFile);

        response = await fetch(
          `${baseUrl}/api/bank/update/${selectedBank.id}`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
      } else {
        // If no new image file, send as application/json
        const payload = {
          name: formData.name,
          type: formData.type,
          supported_methods: methodsArray, // Send as an array
        };

        response = await fetch(
          `${baseUrl}/api/bank/update/${selectedBank.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setSelectedBank(null);
        setFormData({
          name: "",
          type: "",
          supportedMethods: "",
          imageFile: null,
        });
        fetchBanks(); // Refresh the list
        toast.success("Bank information updated successfully!");
      } else {
        setError(data.message || "Failed to update bank information.");
        toast.error(data.message || "Failed to update bank information.");
      }
    } catch (err) {
      setError("Error updating bank information. Please try again.");
      toast.error("Error updating bank information. Please try again.");
      console.error("Error updating bank info:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete bank information
  const deleteBank = async () => {
    if (!selectedBank?.id) {
      setError("No bank selected for deletion.");
      toast.error("No bank selected for deletion.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Assuming DELETE does not require a complex body as per common REST practices
      // If your API explicitly requires the large body you provided, you'd need to add it here.
      const response = await fetch(
        `${baseUrl}/api/bank/delete/${selectedBank.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedBank(null);
        fetchBanks(); // Refresh the list
        toast.success("Bank information deleted successfully!");
      } else {
        setError(data.message || "Failed to delete bank information.");
        toast.error(data.message || "Failed to delete bank information.");
      }
    } catch (err) {
      setError("Error deleting bank information. Please try again.");
      toast.error("Error deleting bank information. Please try again.");
      console.error("Error deleting bank info:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for modal actions
  const handleCreate = () => {
    setFormData({ name: "", type: "", supportedMethods: "", imageFile: null });
    setShowCreateModal(true);
    setError("");
  };

  const handleEdit = (bank: Bank) => {
    setSelectedBank(bank);
    setFormData({
      name: bank.name,
      type: bank.type,
      supportedMethods: bank.supported_methods.join(", "), // Convert array to comma-separated string
      imageFile: null, // Clear file input on edit, user has to re-select if they want to change
    });
    setShowEditModal(true);
    setError("");
  };

  const handleDelete = (bank: Bank) => {
    setSelectedBank(bank);
    setShowDeleteModal(true);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0">
            Bank Information Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            aria-label="Add New Bank Info"
          >
            <Plus size={22} strokeWidth={2.5} />
            Add New Bank Info
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

        {/* Banks Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Supported Methods
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
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
                      Loading bank information...
                    </div>
                  </td>
                </tr>
              ) : banks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 italic"
                  >
                    No bank information found. Click "Add New Bank Info" to
                    create one.
                  </td>
                </tr>
              ) : (
                banks.map((bank: Bank) => (
                  <tr
                    key={bank.id}
                    className="hover:bg-purple-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bank.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bank.image ? (
                        <img
                          src={`${baseUrl}/uploads/${bank.image}`}
                          alt={bank.name}
                          className="h-10 w-10 object-contain rounded-full border border-gray-200"
                          onError={(e) => {
                            // Fallback to a purple-themed placeholder image
                            e.currentTarget.src = `https://placehold.co/40x40/F3E8FF/6B21A8?text=No+Img`;
                            e.currentTarget.alt = "Image not available";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800 font-semibold">
                      {bank.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bank.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <p>{bank.supported_methods.join(", ")}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bank.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bank.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleEdit(bank)}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-all duration-200 transform hover:scale-110 shadow-sm"
                          title="Edit Bank Info"
                          aria-label={`Edit bank ${bank.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bank)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full bg-red-50 hover:bg-red-100 transition-all duration-200 transform hover:scale-110 shadow-sm"
                          title="Delete Bank Info"
                          aria-label={`Delete bank ${bank.name}`}
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
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close create bank info modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Post New Bank Information
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., Rocket, City Bank"
                  aria-required="true"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Type
                </label>
                <input
                  type="text"
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., mobile, bank"
                  aria-required="true"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="edit-supportedMethods"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Supported Methods (comma-separated)
                </label>
                <input
                  type="text"
                  id="supportedMethods"
                  value={formData.supportedMethods}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., cash out, cash in"
                  aria-required="true"
                />
                <p className="text-xs text-gray-500 mt-1">
                  List payment methods, separated by commas.
                </p>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="imageFile"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Image (File)
                </label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a logo or image for the bank.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                  aria-label="Cancel bank info post"
                >
                  Cancel
                </button>
                <button
                  onClick={createBank}
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
                  aria-label="Post bank information"
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
                    "Post Bank Info"
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
                aria-label="Close edit bank info modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Edit Bank Information
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., Rocket, City Bank"
                  aria-required="true"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="edit-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Type
                </label>
                <input
                  type="text"
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., mobile, bank"
                  aria-required="true"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="edit-supportedMethods"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Supported Methods (comma-separated)
                </label>
                <input
                  type="text"
                  id="supportedMethods"
                  value={formData.supportedMethods}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., cash out, cash in"
                  aria-required="true"
                />
                <p className="text-xs text-gray-500 mt-1">
                  List payment methods, separated by commas.
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="edit-imageFile"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bank Image (File) - Leave blank to keep current
                </label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a new image to replace the current one.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                  aria-label="Cancel bank info edit"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBank}
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
                  aria-label="Update bank information"
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
                    "Update Bank Info"
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
                aria-label="Close delete bank info modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Delete Bank Information
              </h2>

              <p className="text-gray-700 mb-8 leading-relaxed">
                Are you sure you want to delete the bank "
                <span className="font-semibold text-purple-800">
                  {selectedBank?.name}
                </span>
                "? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                  aria-label="Cancel deletion"
                >
                  No, Cancel
                </button>
                <button
                  onClick={deleteBank}
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
                  aria-label="Confirm deletion"
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

export default BankInfoManagement;
