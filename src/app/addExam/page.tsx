"use client";
import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

// Define Challenge types based on your API response
type PrizePosition = {
  position: string;
  prize_money: number;
  user_number: number;
  limit: number;
};

type PrizeDetails = {
  prize_positions: PrizePosition[];
  global_board: boolean;
  id: number;
  monthly_eligibility: number;
  weekly_eligibility: number;
  createdAt: string;
  updatedAt: string;
};

type Rules = {
  id: number;
  challenge_type: string;
  title: string;
  points: string[];
  createdAt: string;
  updatedAt: string;
};

type Requirements = {
  id: number;
  number_of_practice_challenges: number;
  number_of_weekly_challenges: number;
  number_of_monthly_challenges: number;
  number_of_mega_challenges: number;
  number_of_special_event_challenges: number;
  number_of_practice_questions_solved: number;
  createdAt: string;
  updatedAt: string;
};

type SpecialEventDetails = {
  id: number;
  title: string;
  content: string;
  image: string;
};

type UserChallengeStatus = {
  id: number;
  challenge_completion_status: string;
  practice_stats: {
    weekly: number;
    monthly: number;
    yearly: number;
    last_3_months: number;
  };
  exam_stats: {
    weekly_exam_stats: number;
    monthly_exam_stats: number;
    mega_exam_stats: number;
  };
};

export type Challenge = {
  id: number;
  challenge_type: "special_event" | "weekly" | "monthly" | "mega"; // Added common types
  fee: number;
  deadline: string;
  quiz_time: number;
  active_status: boolean;
  event_code: string;
  registered_users: number;
  result_finalization: boolean;
  start_datetime: string;
  end_datetime: string;
  total_marks: number;
  total_seats: number;
  available_seats: number;
  createdAt: string;
  updatedAt: string;
  users: UserChallengeStatus[];
  prizeDetails: PrizeDetails[];
  rules: Rules;
  requirements: Requirements;
  specialEventDetails: SpecialEventDetails | null;
};

// Simplified form data for create/edit operations
interface ChallengeFormData {
  challenge_type: "special_event" | "weekly" | "monthly" | "mega" | "";
  fee: number | "";
  deadline: string;
  quiz_time: number | "";
  active_status: boolean;
  event_code: string;
  start_datetime: string;
  end_datetime: string;
  total_marks: number | "";
  total_seats: number | "";
  // Add more fields here as needed for create/edit, potentially nested for rules/prizeDetails
  title?: string; // For specialEventDetails title
  content?: string; // For specialEventDetails content
  image?: string; // For specialEventDetails image
}

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [formData, setFormData] = useState<ChallengeFormData>({
    challenge_type: "",
    fee: "",
    deadline: "",
    quiz_time: "",
    active_status: true,
    event_code: "",
    start_datetime: "",
    end_datetime: "",
    total_marks: "",
    total_seats: "",
    title: "",
    content: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to flatten challenges from API response
  type ApiResponse = {
    [key: string]: Challenge[]; // keys are strings, values are arrays of Challenge
  };

  const flattenChallenges = (apiResponse: ApiResponse) => {
    const flattened: Challenge[] = [];
    for (const key in apiResponse) {
      if (Array.isArray(apiResponse[key])) {
        flattened.push(...apiResponse[key]);
      }
    }
    return flattened;
  };

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/challenges/all-challenges`);
      const data = await response.json();
      if (response.ok) {
        setChallenges(flattenChallenges(data));
        setError("");
      } else {
        setError("Failed to fetch challenges");
      }
    } catch (err) {
      setError("Error fetching challenges");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  const createChallenge = async () => {
    if (
      !formData.challenge_type ||
      formData.fee === "" ||
      formData.quiz_time === "" ||
      !formData.start_datetime ||
      !formData.end_datetime ||
      formData.total_marks === "" ||
      formData.total_seats === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      interface Payload
        extends Omit<
          ChallengeFormData,
          "fee" | "quiz_time" | "total_marks" | "total_seats"
        > {
        fee: number;
        quiz_time: number;
        total_marks: number;
        total_seats: number;
        specialEventDetails?: {
          title?: string;
          content?: string;
          image?: string;
        };
      }

      const payload: Payload = {
        ...formData,
        fee: Number(formData.fee),
        quiz_time: Number(formData.quiz_time),
        total_marks: Number(formData.total_marks),
        total_seats: Number(formData.total_seats),
      };

      // Add specific fields for special_event
      if (formData.challenge_type === "special_event") {
        payload.specialEventDetails = {
          title: formData.title,
          content: formData.content,
          image: formData.image,
        };
      }

      const response = await fetch(`${baseUrl}/api/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setShowCreateModal(false);
        setFormData({
          challenge_type: "",
          fee: "",
          deadline: "",
          quiz_time: "",
          active_status: true,
          event_code: "",
          start_datetime: "",
          end_datetime: "",
          total_marks: "",
          total_seats: "",
          title: "",
          content: "",
          image: "",
        });
        fetchChallenges();
      } else {
        setError(data.message || "Failed to create challenge");
      }
    } catch (err) {
      setError("Error creating challenge");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateChallenge = async () => {
    if (!selectedChallenge?.id) {
      setError("No challenge selected for update.");
      return;
    }

    if (
      !formData.challenge_type ||
      formData.fee === "" ||
      formData.quiz_time === "" ||
      !formData.start_datetime ||
      !formData.end_datetime ||
      formData.total_marks === "" ||
      formData.total_seats === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      interface Payload
        extends Omit<
          ChallengeFormData,
          "fee" | "quiz_time" | "total_marks" | "total_seats"
        > {
        fee: number;
        quiz_time: number;
        total_marks: number;
        total_seats: number;
        specialEventDetails?: {
          title?: string;
          content?: string;
          image?: string;
        };
      }

      const payload: Payload = {
        ...formData,
        fee: Number(formData.fee),
        quiz_time: Number(formData.quiz_time),
        total_marks: Number(formData.total_marks),
        total_seats: Number(formData.total_seats),
      };

      // Add specific fields for special_event
      if (formData.challenge_type === "special_event") {
        payload.specialEventDetails = {
          title: formData.title,
          content: formData.content,
          image: formData.image,
        };
      }

      const response = await fetch(
        `${baseUrl}/api/challenges/${selectedChallenge.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success || response.ok) {
        setShowEditModal(false);
        setSelectedChallenge(null);
        setFormData({
          challenge_type: "",
          fee: "",
          deadline: "",
          quiz_time: "",
          active_status: true,
          event_code: "",
          start_datetime: "",
          end_datetime: "",
          total_marks: "",
          total_seats: "",
          title: "",
          content: "",
          image: "",
        });
        fetchChallenges();
      } else {
        setError(data.message || "Failed to update challenge");
      }
    } catch (err) {
      setError("Error updating challenge");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async () => {
    if (!selectedChallenge?.id) {
      setError("No challenge selected for deletion.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${baseUrl}/api/challenges/${selectedChallenge.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedChallenge(null);
        fetchChallenges();
      } else {
        setError("Failed to delete challenge");
      }
    } catch (err) {
      setError("Error deleting challenge");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFormData({
      challenge_type: challenge.challenge_type,
      fee: challenge.fee,
      deadline: challenge.deadline.split("T")[0], // Format for date input
      quiz_time: challenge.quiz_time,
      active_status: challenge.active_status,
      event_code: challenge.event_code,
      start_datetime: challenge.start_datetime.split("T")[0], // Format for date input
      end_datetime: challenge.end_datetime.split("T")[0], // Format for date input
      total_marks: challenge.total_marks,
      total_seats: challenge.total_seats,
      title: challenge.specialEventDetails?.title || "",
      content: challenge.specialEventDetails?.content || "",
      image: challenge.specialEventDetails?.image || "",
    });
    setShowEditModal(true);
    setError("");
  };

  const handleDelete = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDeleteModal(true);
    setError("");
  };

  const handleCreate = () => {
    setFormData({
      challenge_type: "",
      fee: "",
      deadline: "",
      quiz_time: "",
      active_status: true,
      event_code: "",
      start_datetime: "",
      end_datetime: "",
      total_marks: "",
      total_seats: "",
      title: "",
      content: "",
      image: "",
    });
    setShowCreateModal(true);
    setError("");
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Challenge Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Challenge
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Challenges Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz Time (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
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
                    colSpan={10}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading challenges...
                  </td>
                </tr>
              ) : challenges.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No challenges found
                  </td>
                </tr>
              ) : (
                challenges.map((challenge: Challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {challenge.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.challenge_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.specialEventDetails?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${challenge.fee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.quiz_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(challenge.start_datetime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(challenge.end_datetime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challenge.available_seats}/{challenge.total_seats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {challenge.active_status ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit Challenge"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(challenge)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete Challenge"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[200vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Challenge
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="challenge_type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Challenge Type
                  </label>
                  <select
                    id="challenge_type"
                    name="challenge_type"
                    value={formData.challenge_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="special_event">Special Event</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="mega">Mega</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="fee"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fee
                  </label>
                  <input
                    type="number"
                    id="fee"
                    name="fee"
                    value={formData.fee}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter fee"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quiz_time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quiz Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="quiz_time"
                    name="quiz_time"
                    value={formData.quiz_time}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz time"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline.split("T")[0]} // Ensure date format
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="start_datetime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_datetime"
                    name="start_datetime"
                    value={formData.start_datetime.split("T")[0]} // Ensure date format
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end_datetime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_datetime"
                    name="end_datetime"
                    value={formData.end_datetime.split("T")[0]} // Ensure date format
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_marks"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Marks
                  </label>
                  <input
                    type="number"
                    id="total_marks"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total marks"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_seats"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Seats
                  </label>
                  <input
                    type="number"
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total seats"
                  />
                </div>
                <div>
                  <label
                    htmlFor="event_code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Event Code
                  </label>
                  <input
                    type="text"
                    id="event_code"
                    name="event_code"
                    value={formData.event_code}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event code (optional)"
                  />
                </div>
                <div className="col-span-full flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="active_status"
                    name="active_status"
                    checked={formData.active_status}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="active_status"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active Status
                  </label>
                </div>

                {formData.challenge_type === "special_event" && (
                  <>
                    <hr className="col-span-full my-4" />
                    <h3 className="col-span-full text-lg font-semibold text-gray-800">
                      Special Event Details
                    </h3>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter special event title"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Content
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter special event content"
                      />
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter image URL"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createChallenge}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal (reusing the same form structure) */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Challenge
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="challenge_type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Challenge Type
                  </label>
                  <select
                    id="challenge_type"
                    name="challenge_type"
                    value={formData.challenge_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled // Often challenge type is not editable after creation
                  >
                    <option value="">Select Type</option>
                    <option value="special_event">Special Event</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="mega">Mega</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="fee"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fee
                  </label>
                  <input
                    type="number"
                    id="fee"
                    name="fee"
                    value={formData.fee}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter fee"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quiz_time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quiz Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="quiz_time"
                    name="quiz_time"
                    value={formData.quiz_time}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quiz time"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline.split("T")[0]}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="start_datetime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_datetime"
                    name="start_datetime"
                    value={formData.start_datetime.split("T")[0]}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end_datetime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_datetime"
                    name="end_datetime"
                    value={formData.end_datetime.split("T")[0]}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_marks"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Marks
                  </label>
                  <input
                    type="number"
                    id="total_marks"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total marks"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_seats"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Seats
                  </label>
                  <input
                    type="number"
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter total seats"
                  />
                </div>
                <div>
                  <label
                    htmlFor="event_code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Event Code
                  </label>
                  <input
                    type="text"
                    id="event_code"
                    name="event_code"
                    value={formData.event_code}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event code (optional)"
                  />
                </div>
                <div className="col-span-full flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="active_status"
                    name="active_status"
                    checked={formData.active_status}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="active_status"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Active Status
                  </label>
                </div>

                {formData.challenge_type === "special_event" && (
                  <>
                    <hr className="col-span-full my-4" />
                    <h3 className="col-span-full text-lg font-semibold text-gray-800">
                      Special Event Details
                    </h3>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter special event title"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Content
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter special event content"
                      />
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter image URL"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateChallenge}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Challenge
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
                  Are you sure you want to delete the{" "}
                  <span className="font-semibold">
                    {selectedChallenge?.challenge_type}
                  </span>{" "}
                  challenge with ID &quot;
                  <span className="font-semibold">{selectedChallenge?.id}</span>
                  &quot;? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={deleteChallenge}
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

export default ChallengeManagement;
