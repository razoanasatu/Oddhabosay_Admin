"use client";
import { baseUrl } from "@/utils/constant"; // Assuming baseUrl is correctly defined here
import { Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is set up

// Type definition for a Contact Us message entry
type ContactMessage = {
  id: number;
  name: string;
  contact_no: string;
  message: string;
  user: {
    id: number;
    type: string;
    full_name: string;
    email: string;
    phone_no: string;
    account_number: string;
    accepted_terms: boolean;
    accepted_terms_time: string;
    city: string;
    country: string;
    state: string | null;
    zip_code: string;
    latitude: number;
    longitude: number;
    institution_name: string;
    institution_type: string;
    birth_date: string;
    address: string;
    total_prize_money_received: string;
    total_withdrawal: string;
    total_spent: string;
    deviceToken: string;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
};

const ContactUsManagement = () => {
  // State variables for managing contact messages data and UI
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );

  /**
   * Fetches the list of Contact Us messages from the API.
   */
  const fetchContactMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/contact-us`);
      const data = await response.json();
      if (data.success) {
        setContactMessages(data.data);
      } else {
        toast.error(data.message || "Failed to fetch contact messages.");
        setError(data.message || "Failed to fetch contact messages.");
      }
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      toast.error("Error fetching contact messages.");
      setError("Error fetching contact messages.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch contact messages on component mount
  useEffect(() => {
    fetchContactMessages();
  }, []);

  /**
   * Handles opening the Delete Confirmation modal.
   * @param message The contact message object to delete.
   */
  const handleDeleteClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDeleteConfirmModal(true);
  };

  /**
   * Handles confirming and executing the deletion of a contact message entry.
   */
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/contact-us/${selectedMessage.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          // As per your API, DELETE expects a body with user details.
          // This is unusual for a DELETE, but implemented as per your specification.
          // You might need to adjust these values based on your authentication context.
          body: JSON.stringify({
            full_name: selectedMessage.user?.full_name || "N/A",
            email: selectedMessage.user?.email || "N/A",
            phone_no: selectedMessage.user?.phone_no || "N/A",
            accepted_terms: selectedMessage.user?.accepted_terms || false,
            accepted_terms_time:
              selectedMessage.user?.accepted_terms_time ||
              new Date().toISOString(),
            city: selectedMessage.user?.city || "N/A",
            country: selectedMessage.user?.country || "N/A",
            state: selectedMessage.user?.state || null,
            zip_code: selectedMessage.user?.zip_code || "",
            latitude: selectedMessage.user?.latitude || 0,
            longitude: selectedMessage.user?.longitude || 0,
            institution_name: selectedMessage.user?.institution_name || "N/A",
            birth_date:
              selectedMessage.user?.birth_date || new Date().toISOString(),
            address: selectedMessage.user?.address || "N/A",
            total_prize_money_received:
              selectedMessage.user?.total_prize_money_received || 0,
          }),
        }
      );

      if (response.ok) {
        toast.success("Contact message deleted successfully.");
        fetchContactMessages(); // Refresh the list
        setShowDeleteConfirmModal(false); // Close the modal
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete contact message.");
      }
    } catch (err) {
      console.error("Error deleting contact message:", err);
      toast.error("Error deleting contact message.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900">
            Contact Us Messages
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

        {/* Contact Messages List Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Contact No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  User Email
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
                    Loading contact messages...
                  </td>
                </tr>
              ) : contactMessages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                contactMessages.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {entry.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {entry.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {entry.contact_no}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">
                      {entry.message}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      {entry.user?.email || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end space-x-2">
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && selectedMessage && (
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
                Are you sure you want to delete the message from "
                <span className="font-semibold">{selectedMessage.name}</span>"
                (ID: {selectedMessage.id})? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMessage}
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

export default ContactUsManagement;
