"use client";
import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Assuming react-toastify is already installed and configured

// Define ChallengeType and Challenge interfaces based on user's provided code
export type ChallengeType =
  | "special_event"
  | "weekly"
  | "monthly"
  | "mega"
  | "practice";

export interface Challenge {
  id: number;
  challenge_type: ChallengeType;
  fee: number;
  deadline: string; // ISO datetime
  quiz_time: number; // in minutes
  active_status: boolean;
  event_code: string | null;
  registered_users: number;
  result_finalization: boolean;
  start_datetime: string;
  end_datetime: string;
  total_marks: number;
  total_seats: number;
  available_seats: number;
  createdAt: string;
  updatedAt: string;
  // Note: UserChallengeStatus, PrizeDetails, Rule, Requirement, SpecialEventDetails, Question, Event are not fully defined here
  // but are included as per the user's Challenge interface.
  users: any[]; // array of registered users' challenge progress
  prizeDetails: any[]; // array of prize slabs
  rules: any | null; // rule may be null if not defined
  requirements: any;
  specialEventDetails: any | null;
  questions: any[]; // array of questions (can be empty)
  eventId: number | null; // links to external event table, if applicable
  name?: string; // Added 'name' for display in dropdown, will be generated during flattening
}

// Existing types for Notification Schedule
type Notification = {
  id: number;
  message: string;
  is_prize_money: boolean;
  date: string; // ISO string
};

type NotificationSchedule = {
  id: number;
  scheduledFor: string; // ISO string
  isChallengeSpecific: boolean;
  sent: boolean;
  notification: Notification;
  challenges: Challenge[];
};

const NotificationScheduleManagement = () => {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [challengesList, setChallengesList] = useState<Challenge[]>([]); // To populate the challenge selection dropdown
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<NotificationSchedule | null>(null);
  const [formData, setFormData] = useState({
    message: "",
    is_prize_money: false,
    scheduledFor: "", // Will be a datetime-local string (YYYY-MM-DDTHH:MM)
    isChallengeSpecific: false,
    challenges: [] as { id: number }[], // Array of { id: number }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to format ISO string to datetime-local string (YYYY-MM-DDTHH:MM)
  const formatIsoToDatetimeLocal = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Adjust for local timezone offset to display correctly in input type="datetime-local"
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  // Helper to convert datetime-local string to ISO string (UTC)
  const formatDatetimeLocalToIso = (datetimeLocalString: string) => {
    if (!datetimeLocalString) return "";
    // Create a Date object from the local datetime string
    const date = new Date(datetimeLocalString);
    // Convert to ISO string, which will be in UTC
    return date.toISOString();
  };

  // Fetch all notification schedules
  const fetchSchedules = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/notification-schedule`);
      const data = await response.json();
      if (
        data.message === "✅ Retrieved scheduled notifications successfully"
      ) {
        setSchedules(data.data);
      } else {
        setError(data.message || "Failed to fetch schedules");
        toast.error(data.message || "Failed to fetch schedules");
      }
    } catch (err) {
      setError("Error fetching schedules. Please try again.");
      toast.error("Error fetching schedules. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten challenges from API response (adapted from user's provided code)
  type ApiResponse = {
    [key: string]: Challenge[]; // keys are strings, values are arrays of Challenge
  };

  const flattenChallenges = (apiResponse: ApiResponse): Challenge[] => {
    const flattened: Challenge[] = [];

    for (const key in apiResponse) {
      const challenges = apiResponse[key];
      if (Array.isArray(challenges)) {
        challenges.forEach((item) => {
          flattened.push({
            ...item,
            name: `${
              item.challenge_type?.charAt(0).toUpperCase() +
              item.challenge_type?.slice(1)
            } Challenge - ID: ${item.id}`,
            prizeDetails: item.prizeDetails ?? [],
          });
        });
      }
    }

    return flattened;
  };

  // Fetch all challenges for selection
  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/challenges/all-challenges`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "API Error fetching challenges:",
          response.status,
          errorData
        );
        toast.error(
          `Failed to fetch challenges: ${
            errorData.message || response.statusText
          }`
        );
        return;
      }

      const data = await response.json();
      console.log("Raw API response for challenges:", data);

      // Defensive check: Ensure structure matches expectation
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        toast.error("Unexpected response format from challenges API.");
        return;
      }

      const processedChallenges = flattenChallenges(data);

      if (!processedChallenges.length) {
        toast.warn("No challenges found from the API.");
      }

      setChallengesList(processedChallenges);
    } catch (err) {
      console.error("Network Error fetching challenges:", err);
      toast.error(
        "Network error while fetching challenges. Please try again later."
      );
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle challenge selection change
  const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => ({
      id: parseInt(option.value),
    }));
    setFormData((prev) => ({
      ...prev,
      challenges: selectedOptions,
    }));
  };

  // Create a new notification schedule
  const createSchedule = async () => {
    if (!formData.message.trim() || !formData.scheduledFor.trim()) {
      setError("Message and Scheduled Date/Time are required");
      toast.error("Message and Scheduled Date/Time are required");
      return;
    }

    if (formData.isChallengeSpecific && formData.challenges.length === 0) {
      setError(
        "Please select at least one challenge for challenge-specific notifications."
      );
      toast.error(
        "Please select at least one challenge for challenge-specific notifications."
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        scheduledFor: formatDatetimeLocalToIso(formData.scheduledFor), // Convert to ISO string
      };

      const response = await fetch(`${baseUrl}/api/notification-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          message: "",
          is_prize_money: false,
          scheduledFor: "",
          isChallengeSpecific: false,
          challenges: [],
        });
        fetchSchedules();
        toast.success("Notification schedule created successfully!");
      } else {
        setError(data.message || "Failed to create schedule");
        toast.error(data.message || "Failed to create schedule");
      }
    } catch (err) {
      setError("Error creating schedule. Please try again.");
      toast.error("Error creating schedule. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing notification schedule
  const updateSchedule = async () => {
    if (!formData.message.trim() || !formData.scheduledFor.trim()) {
      setError("Message and Scheduled Date/Time are required");
      toast.error("Message and Scheduled Date/Time are required");
      return;
    }

    if (formData.isChallengeSpecific && formData.challenges.length === 0) {
      setError(
        "Please select at least one challenge for challenge-specific notifications."
      );
      toast.error(
        "Please select at least one challenge for challenge-specific notifications."
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        scheduledFor: formatDatetimeLocalToIso(formData.scheduledFor), // Convert to ISO string
      };

      const response = await fetch(
        `${baseUrl}/api/notification-schedule/${selectedSchedule?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setShowEditModal(false);
        setSelectedSchedule(null);
        setFormData({
          message: "",
          is_prize_money: false,
          scheduledFor: "",
          isChallengeSpecific: false,
          challenges: [],
        });
        fetchSchedules();
        toast.success("Notification schedule updated successfully!");
      } else {
        setError(data.message || "Failed to update schedule");
        toast.error(data.message || "Failed to update schedule");
      }
    } catch (err) {
      setError("Error updating schedule. Please try again.");
      toast.error("Error updating schedule. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification schedule
  const deleteSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${baseUrl}/api/notification-schedule/${selectedSchedule?.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedSchedule(null);
        fetchSchedules();
        toast.success("Notification schedule deleted successfully!");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete schedule");
        toast.error(data.message || "Failed to delete data");
      }
    } catch (err) {
      setError("Error deleting schedule. Please try again.");
      toast.error("Error deleting schedule. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for modal visibility and data population
  const handleEdit = (schedule: NotificationSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      message: schedule.notification.message,
      is_prize_money: schedule.notification.is_prize_money,
      scheduledFor: formatIsoToDatetimeLocal(schedule.scheduledFor),
      isChallengeSpecific: schedule.isChallengeSpecific,
      challenges: schedule.challenges.map((c) => ({ id: c.id })),
    });
    setShowEditModal(true);
    setError("");
  };

  const handleDelete = (schedule: NotificationSchedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
    setError("");
  };

  const handleCreate = () => {
    setFormData({
      message: "",
      is_prize_money: false,
      scheduledFor: "",
      isChallengeSpecific: false,
      challenges: [],
    });
    setShowCreateModal(true);
    setError("");
  };

  useEffect(() => {
    fetchSchedules();
    fetchChallenges(); // Fetch challenges when component mounts
    // You can uncomment the mock data below for testing if your /api/challenges endpoint is not yet ready
    /*
    setChallengesList([
      { id: 1, name: "Mock Weekly Challenge - ID: 1", challenge_type: "weekly" },
      { id: 2, name: "Mock Monthly Challenge - ID: 2", challenge_type: "monthly" },
      { id: 3, name: "Mock Special Event Challenge - ID: 3", challenge_type: "special_event" },
    ]);
    */
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0">
            Notification Schedule Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus size={22} strokeWidth={2.5} />
            Schedule New Notification
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

        {/* Schedules Table */}
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Scheduled For
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Challenge Specific
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Challenges
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Sent
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
                      Loading schedules...
                    </div>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 italic"
                  >
                    No notification schedules found. Click "Schedule New
                    Notification" to create one.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule: NotificationSchedule) => (
                  <tr
                    key={schedule.id}
                    className="hover:bg-purple-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {schedule.id}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-800 font-semibold max-w-xs overflow-hidden text-ellipsis">
                      {schedule.notification.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(schedule.scheduledFor).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {schedule.isChallengeSpecific ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {schedule.isChallengeSpecific &&
                      schedule.challenges.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {schedule.challenges.map((challenge) => (
                            <li key={challenge.id}>{challenge.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {schedule.sent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-all duration-200 transform hover:scale-110 shadow-sm"
                          title="Edit Schedule"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full bg-red-50 hover:bg-red-100 transition-all duration-200 transform hover:scale-110 shadow-sm"
                          title="Delete Schedule"
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
                aria-label="Close create schedule modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Schedule New Notification
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                    placeholder="Enter notification message"
                    aria-required="true"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_prize_money"
                    name="is_prize_money"
                    checked={formData.is_prize_money}
                    onChange={handleChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_prize_money"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Is Prize Money Related?
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="scheduledFor"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Scheduled For (Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledFor"
                    name="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                    aria-required="true"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isChallengeSpecific"
                    name="isChallengeSpecific"
                    checked={formData.isChallengeSpecific}
                    onChange={handleChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isChallengeSpecific"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Is Challenge Specific?
                  </label>
                </div>

                {formData.isChallengeSpecific && (
                  <div>
                    <label
                      htmlFor="challenges"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Select Challenges
                    </label>
                    <select
                      id="challenges"
                      name="challenges"
                      multiple
                      value={formData.challenges.map((c) => c.id.toString())} // Convert to string for select value
                      onChange={handleChallengeChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm h-32"
                      aria-required={formData.isChallengeSpecific}
                    >
                      {challengesList.length > 0 ? (
                        challengesList.map((challenge) => (
                          <option key={challenge.id} value={challenge.id}>
                            {challenge.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No challenges available</option>
                      )}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createSchedule}
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
                    "Create Schedule"
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
                aria-label="Close edit schedule modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Edit Notification Schedule
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="edit-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                    placeholder="Enter notification message"
                    aria-required="true"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-is_prize_money"
                    name="is_prize_money"
                    checked={formData.is_prize_money}
                    onChange={handleChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="edit-is_prize_money"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Is Prize Money Related?
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="edit-scheduledFor"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Scheduled For (Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    id="edit-scheduledFor"
                    name="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                    aria-required="true"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-isChallengeSpecific"
                    name="isChallengeSpecific"
                    checked={formData.isChallengeSpecific}
                    onChange={handleChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="edit-isChallengeSpecific"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Is Challenge Specific?
                  </label>
                </div>

                {formData.isChallengeSpecific && (
                  <div>
                    <label
                      htmlFor="edit-challenges"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Select Challenges
                    </label>
                    <select
                      id="edit-challenges"
                      name="challenges"
                      multiple
                      value={formData.challenges.map((c) => c.id.toString())}
                      onChange={handleChallengeChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-base shadow-sm h-32"
                      aria-required={formData.isChallengeSpecific}
                    >
                      {challengesList.length > 0 ? (
                        challengesList.map((challenge) => (
                          <option key={challenge.id} value={challenge.id}>
                            {challenge.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No challenges available</option>
                      )}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSchedule}
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
                    "Update Schedule"
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
                aria-label="Close delete schedule modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Delete Notification Schedule
              </h2>

              <p className="text-gray-700 mb-8 leading-relaxed">
                Are you sure you want to delete the notification schedule for "
                <span className="font-semibold text-purple-800">
                  {selectedSchedule?.notification.message}
                </span>
                " scheduled for{" "}
                <span className="font-semibold text-purple-800">
                  {selectedSchedule &&
                    new Date(selectedSchedule.scheduledFor).toLocaleString()}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  No, Cancel
                </button>
                <button
                  onClick={deleteSchedule}
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

export default NotificationScheduleManagement;
