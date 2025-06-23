"use client";
import QuestionSelector from "@/app/questionSelection/page";
import { baseUrl } from "@/utils/constant";
import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
//import QuestionSelector from "../questionSelection/QuestionSelector";
// Define Challenge types based on your API response
export type PrizePosition = {
  position: string;
  prize_money: number;
  user_number: number;
  limit: number;
};

export type PrizeDetails = {
  prize_structure: Record<string, PrizePosition[]>;
  global_board: boolean;
  id: number;
  monthly_eligibility: number;
  weekly_eligibility: number;
  createdAt: string;
  updatedAt: string;
};

export type Rule = {
  // Exported for use in Challenge type
  id: number;
  challenge_type: string;
  title: string;
  points: string[];
  createdAt: string;
  updatedAt: string;
};

export type Requirement = {
  // Exported for use in Challenge type
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

export type SpecialEventDetails = {
  // Exported for use in Challenge type
  id: number;
  title: string;
  content: string;
  image: string;
};

export type Question = {
  // New type for questions (Matches the type from QuestionSelector)
  id: number;
  question: string;
  answers: string[];
  correct_answer: number;
  score: number;
  eligibility_flag: string[];
  createdAt: string;
  subjectId: number; // Add subjectId as per QuestionSelector's processed type
  subject?: {
    // Make optional as it might not always be nested initially
    id: number;
    name: string;
  };
};

export type Event = {
  // New type for events (for special challenges)
  id: number;
  title: string; // Assuming event also has a title
  // Add other event properties if available from API
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
  users: UserChallengeStatus[]; // array of registered users' challenge progress
  prizeDetails: PrizeDetails[]; // array of prize slabs
  rules: Rule | null; // rule may be null if not defined
  requirements: Requirement;
  specialEventDetails: SpecialEventDetails | null;
  questions: Question[]; // array of questions (can be empty)
  eventId: number | null; // links to external event table, if applicable
}

interface ChallengeFormData {
  challenge_type:
    | "weekly"
    | "monthly"
    | "mega"
    | "special_event"
    | "practice"
    | "";
  fee: number | string;
  deadline: string;
  deadlineDate: string;
  deadlineTime: string;
  quiz_time: number | string;
  active_status: boolean;
  event_code: string;
  start_datetime: string;
  start_datetime_date: string;
  start_datetime_time: string;
  end_datetime: string;
  end_datetime_date: string;
  end_datetime_time: string;
  total_marks: number | string;
  total_seats: number | string;
  questionIds: number[];
  prizeDetailsId: number | ""; // ensure this is number or empty string
  challengeRequirementId: number | "";
  ruleId: number | "";
  eventId: number | ""; // optional for special events
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
    // Deadline fields
    deadlineDate: "", // To store the date part (e.g., "YYYY-MM-DD")
    deadlineTime: "", // To store the time part (e.g., "HH:mm")
    deadline: "", // Keep this for the combined ISO string to send to the backend

    quiz_time: "",
    active_status: true,
    event_code: "",
    // Start Datetime fields (initialize them)
    start_datetime_date: "",
    start_datetime_time: "",
    start_datetime: "", // This will be populated from the _date and _time fields

    // End Datetime fields (initialize them)
    end_datetime_date: "",
    end_datetime_time: "",
    end_datetime: "", // This will be populated from the _date and _time fields

    total_marks: "",
    total_seats: "",
    questionIds: [],
    prizeDetailsId: "",
    challengeRequirementId: "",
    ruleId: "",
    eventId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // States for dropdown data
  // NOTE: 'questions' state is no longer needed as a source for the dropdown,
  // but we keep it if other parts of the component or UI might still need a global list of all questions.
  // If not, you can remove `setQuestions` and related `fetchQuestions` call from useEffect.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questions, setQuestions] = useState<Question[]>([]); // Still needed if you fetch all questions, otherwise can be removed.
  const router = useRouter();

  const [prizeDetailsOptions, setPrizeDetailsOptions] = useState<
    PrizeDetails[]
  >([]);
  const [challengeRequirements, setChallengeRequirements] = useState<
    Requirement[]
  >([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [events, setEvents] = useState<Event[]>([]); // For special event types

  // NEW STATES FOR QUESTION SELECTOR INTEGRATION
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
  const [selectedQuestionsDetails, setSelectedQuestionsDetails] = useState<
    Question[]
  >([]); // To store full question objects for display and management

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

  // --- Fetching Dropdown Data (excluding questions as QuestionSelector handles its own fetch) ---
  // The fetchQuestions is still here, but if QuestionSelector is truly standalone,
  // you might not need this fetch anymore for the dropdown.
  // However, `handleRemoveSelectedQuestion` currently relies on `questions` state
  // to find the question detail from ID, which won't work if it's not fetched.
  // The better approach is to use `selectedQuestionsDetails` for tag display.
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/question-bank`);
      const data = await response.json();
      if (response.ok && data.success) {
        setQuestions(data.data); // Keep this if `handleRemoveSelectedQuestion` still uses it to look up question details.
      } else {
        console.error("Failed to fetch questions:", data.message);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const fetchPrizeDetails = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/prize-details`);
      const data = await response.json();
      if (response.ok && data.success) {
        setPrizeDetailsOptions(data.data);
      } else {
        console.error("Failed to fetch prize details:", data.message);
      }
    } catch (err) {
      console.error("Error fetching prize details:", err);
    }
  };

  const fetchChallengeRequirements = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/challenge-requirement`);
      const data = await response.json();
      if (response.ok && data.success) {
        setChallengeRequirements(data.data);
      } else {
        console.error("Failed to fetch challenge requirements:", data.message);
      }
    } catch (err) {
      console.error("Error fetching challenge requirements:", err);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/challenge-rules`);
      const data = await response.json();
      if (response.ok && data.success) {
        setRules(data.data);
      } else {
        console.error("Failed to fetch rules:", data.message);
      }
    } catch (err) {
      console.error("Error fetching rules:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      // Assuming an API endpoint for events for special challenges
      const response = await fetch(`${baseUrl}/api/special-event`);
      const data = await response.json();
      if (response.ok && data.success) {
        setEvents(data.data);
        console.log("Events are :", data.data);
      } else {
        console.error("Failed to fetch events:", data.message);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prevData) => {
      // Start with the previous data and update the current changed field
      let newFormData = { ...prevData };

      if (type === "checkbox") {
        newFormData = {
          ...newFormData,
          [name]: (e.target as HTMLInputElement).checked,
        };
      } else {
        newFormData = { ...newFormData, [name]: value };
      }

      // --- Logic for Deadline combination ---
      // If either deadlineDate or deadlineTime was just changed, or if we're initializing
      if (
        name === "deadlineDate" ||
        name === "deadlineTime" ||
        !prevData.deadline
      ) {
        if (newFormData.deadlineDate && newFormData.deadlineTime) {
          newFormData.deadline = `${newFormData.deadlineDate}T${newFormData.deadlineTime}:00`;
        } else {
          // If one part is missing, set deadline to just the available date or empty
          newFormData.deadline = newFormData.deadlineDate || "";
        }
      }

      // --- Logic for Start Datetime combination ---
      // If either start_datetime_date or start_datetime_time was just changed, or if we're initializing
      if (
        name === "start_datetime_date" ||
        name === "start_datetime_time" ||
        !prevData.start_datetime
      ) {
        if (
          newFormData.start_datetime_date &&
          newFormData.start_datetime_time
        ) {
          newFormData.start_datetime = `${newFormData.start_datetime_date}T${newFormData.start_datetime_time}:00`;
        } else {
          newFormData.start_datetime = newFormData.start_datetime_date || "";
        }
      }

      // --- Logic for End Datetime combination ---
      // If either end_datetime_date or end_datetime_time was just changed, or if we're initializing
      if (
        name === "end_datetime_date" ||
        name === "end_datetime_time" ||
        !prevData.end_datetime
      ) {
        if (newFormData.end_datetime_date && newFormData.end_datetime_time) {
          newFormData.end_datetime = `${newFormData.end_datetime_date}T${newFormData.end_datetime_time}:00`;
        } else {
          newFormData.end_datetime = newFormData.end_datetime_date || "";
        }
      }

      return newFormData;
    });
  };

  // REMOVE: This handler is for a multi-select dropdown, which we are replacing.
  // const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedValues = Array.from(e.target.selectedOptions).map((option) =>
  //     Number(option.value)
  //   );
  //   setFormData((prev) => ({
  //     ...prev,
  //     questionIds: selectedValues,
  //   }));
  // };

  // NEW: Function to open the QuestionSelector modal/pop-up
  const handleOpenQuestionSelector = () => {
    setIsQuestionSelectorOpen(true);
  };

  // NEW: Function to handle the selection from QuestionSelector
  const handleQuestionsSelected = (selectedQs: Question[]) => {
    setSelectedQuestionsDetails(selectedQs);
    setFormData((prev) => ({
      ...prev,
      questionIds: selectedQs.map((q) => q.id),
    }));
    setIsQuestionSelectorOpen(false); // Close the selector
  };

  // MODIFIED: Function to remove a selected question from the tags
  // It now primarily works on `selectedQuestionsDetails` and then updates `formData.questionIds`
  const handleRemoveSelectedQuestion = (idToRemove: number) => {
    setSelectedQuestionsDetails((prev) =>
      prev.filter((q) => q.id !== idToRemove)
    );
    setFormData((prev) => ({
      ...prev,
      questionIds: prev.questionIds.filter((id) => id !== idToRemove),
    }));
  };

  const createChallenge = async () => {
    // Basic validation
    if (
      !formData.challenge_type ||
      formData.fee === "" ||
      formData.quiz_time === "" ||
      !formData.start_datetime ||
      !formData.end_datetime ||
      formData.total_marks === "" ||
      formData.total_seats === "" ||
      formData.questionIds.length === 0 || // Questions are required
      formData.prizeDetailsId === "" || // Prize details required
      formData.challengeRequirementId === "" || // Challenge requirement required
      formData.ruleId === "" || // Rule required
      (formData.challenge_type === "special_event" && formData.eventId === "") // Event ID required for special event
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
          | "fee"
          | "quiz_time"
          | "total_marks"
          | "total_seats"
          | "prizeDetailsId"
          | "challengeRequirementId"
          | "ruleId"
          | "eventId"
          | "deadlineDate" // Remove UI-specific fields from payload
          | "deadlineTime" // Remove UI-specific fields from payload
          | "start_datetime_date" // Remove UI-specific fields from payload
          | "start_datetime_time" // Remove UI-specific fields from payload
          | "end_datetime_date" // Remove UI-specific fields from payload
          | "end_datetime_time" // Remove UI-specific fields from payload
        > {
        fee: number;
        quiz_time: number;
        total_marks: number;
        total_seats: number;
        prizeDetailsIds: number[]; // Send as array as per original payload, even if single selected
        challengeRequirementId: number;
        ruleId: number;
        eventId?: number; // Optional for special events
      }

      const payload: Payload = {
        ...formData,
        fee: Number(formData.fee),
        quiz_time: Number(formData.quiz_time),
        total_marks: Number(formData.total_marks),
        total_seats: Number(formData.total_seats),

        // required field — always ensure number
        challengeRequirementId: Number(formData.challengeRequirementId || 0),

        // required field — always ensure number
        ruleId: Number(formData.ruleId || 0),

        // optional field — check for string before conversion
        eventId: formData.eventId !== "" ? Number(formData.eventId) : undefined,

        // plural array field
        prizeDetailsIds:
          typeof formData.prizeDetailsId === "number" &&
          !isNaN(formData.prizeDetailsId)
            ? [formData.prizeDetailsId]
            : [],
      };

      if (formData.challenge_type === "special_event") {
        // Only assign eventId if it's a number (not an empty string)
        if (typeof formData.eventId === "number") {
          payload.eventId = formData.eventId;
        } else if (formData.eventId !== "") {
          // If it's a string from select, convert to number
          payload.eventId = Number(formData.eventId);
        }
        // Remove deprecated special event details fields from payload
        if ("title" in payload) delete payload.title; // These fields are not on ChallengeFormData payload
        if ("content" in payload) delete payload.content; // These fields are not on ChallengeFormData payload
        if ("image" in payload) delete payload.image; // These fields are not on ChallengeFormData payload
      } else {
        // Ensure eventId and event_code are not sent for non-special events
        if ("eventId" in payload) delete payload.eventId;
        payload.event_code = ""; // Clear event code for non-special events
      }

      const response = await fetch(`${baseUrl}/api/challenges/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success || response.ok) {
        setShowCreateModal(false);
        // Clear all form data and selected questions details after successful creation
        setFormData({
          challenge_type: "",
          fee: "",
          deadlineDate: "",
          deadlineTime: "",
          deadline: "",
          quiz_time: "",
          active_status: true,
          event_code: "",
          start_datetime_date: "",
          start_datetime_time: "",
          start_datetime: "",
          end_datetime_date: "",
          end_datetime_time: "",
          end_datetime: "",
          total_marks: "",
          total_seats: "",
          questionIds: [],
          prizeDetailsId: "",
          challengeRequirementId: "",
          ruleId: "",
          eventId: "",
        });
        setSelectedQuestionsDetails([]); // Clear selected question details
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

    // Basic validation
    if (
      !formData.challenge_type ||
      formData.fee === "" ||
      formData.quiz_time === "" ||
      !formData.start_datetime ||
      !formData.end_datetime ||
      formData.total_marks === "" ||
      formData.total_seats === "" ||
      formData.questionIds.length === 0 ||
      formData.prizeDetailsId === "" ||
      formData.challengeRequirementId === "" ||
      formData.ruleId === "" ||
      (formData.challenge_type === "special_event" && formData.eventId === "")
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
          | "fee"
          | "quiz_time"
          | "total_marks"
          | "total_seats"
          | "prizeDetailsId"
          | "challengeRequirementId"
          | "ruleId"
          | "eventId"
          | "deadlineDate"
          | "deadlineTime"
          | "start_datetime_date"
          | "start_datetime_time"
          | "end_datetime_date"
          | "end_datetime_time"
        > {
        challengeId: number;
        fee: number;
        quiz_time: number;
        total_marks: number;
        total_seats: number;
        prizeDetailsIds: number[];
        challengeRequirementId: number;
        ruleId: number;
        eventId?: number;
      }

      const payload: Payload = {
        ...formData,
        challengeId: selectedChallenge.id,
        fee: Number(formData.fee),
        quiz_time: Number(formData.quiz_time),
        total_marks: Number(formData.total_marks),
        total_seats: Number(formData.total_seats),
        prizeDetailsIds: formData.prizeDetailsId
          ? [Number(formData.prizeDetailsId)]
          : [],
        challengeRequirementId: Number(formData.challengeRequirementId),
        ruleId: Number(formData.ruleId),
        eventId:
          formData.challenge_type === "special_event" && formData.eventId !== ""
            ? Number(formData.eventId)
            : undefined,
      };

      if (formData.challenge_type !== "special_event") {
        payload.event_code = "";
        delete payload.eventId;
      }

      const response = await fetch(`${baseUrl}/api/challenges/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setShowEditModal(false);
        setSelectedChallenge(null);
        setFormData({
          challenge_type: "",
          fee: "",
          deadlineDate: "",
          deadlineTime: "",
          deadline: "",
          quiz_time: "",
          active_status: true,
          event_code: "",
          start_datetime_date: "",
          start_datetime_time: "",
          start_datetime: "",
          end_datetime_date: "",
          end_datetime_time: "",
          end_datetime: "",
          total_marks: "",
          total_seats: "",
          questionIds: [],
          prizeDetailsId: "",
          challengeRequirementId: "",
          ruleId: "",
          eventId: "",
        });
        setSelectedQuestionsDetails([]);
        fetchChallenges(); // refresh list
      } else {
        setError(data.message || "Failed to update challenge");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating challenge.");
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
        `${baseUrl}/api/challenges/delete/${selectedChallenge.id}`,
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

  // MODIFIED: Handle edit to populate `selectedQuestionsDetails`
  const handleEdit = async (challenge: Challenge) => {
    try {
      setSelectedChallenge(challenge);

      // Preload dropdowns
      await Promise.all([
        fetchPrizeDetails(),
        fetchChallengeRequirements(),
        fetchRules(),
        fetchEvents(),
      ]);

      // 🔽 Fetch preselected questions
      const res = await fetch(
        `${baseUrl}/api/challenges/${challenge.id}/questions`
      );
      const data = await res.json();
      const preselectedQuestions = data.data || [];

      // 🔁 Set form data
      setFormData({
        challenge_type: challenge.challenge_type,
        fee: challenge.fee,
        deadlineDate: challenge.deadline?.split("T")[0] || "",
        deadlineTime: challenge.deadline?.split("T")[1]?.substring(0, 5) || "",
        deadline: challenge.deadline,

        quiz_time: challenge.quiz_time,
        active_status: challenge.active_status,
        event_code: challenge.event_code || "",

        start_datetime_date: challenge.start_datetime?.split("T")[0] || "",
        start_datetime_time:
          challenge.start_datetime?.split("T")[1]?.substring(0, 5) || "",
        start_datetime: challenge.start_datetime,

        end_datetime_date: challenge.end_datetime?.split("T")[0] || "",
        end_datetime_time:
          challenge.end_datetime?.split("T")[1]?.substring(0, 5) || "",
        end_datetime: challenge.end_datetime,

        total_marks: challenge.total_marks,
        total_seats: challenge.total_seats,

        questionIds: preselectedQuestions.map((q: Question) => q.id),
        prizeDetailsId: challenge.prizeDetails?.[0]?.id ?? "",
        challengeRequirementId: challenge.requirements?.id ?? "",
        ruleId: challenge.rules?.id ?? "",
        eventId: challenge.specialEventDetails?.id ?? "",
      });

      setSelectedQuestionsDetails(preselectedQuestions);
      setShowEditModal(true);
      setError("");
    } catch (err) {
      console.error("Error in handleEdit:", err);
      setError("Failed to load challenge for editing.");
    }
  };

  const handleDelete = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDeleteModal(true);
    setError("");
  };

  // MODIFIED: Handle create to clear `selectedQuestionsDetails`
  const handleCreate = () => {
    setFormData({
      challenge_type: "",
      fee: "",
      deadlineDate: "",
      deadlineTime: "",
      deadline: "",
      quiz_time: "",
      active_status: true,
      event_code: "",
      start_datetime_date: "",
      start_datetime_time: "",
      start_datetime: "",
      end_datetime_date: "",
      end_datetime_time: "",
      end_datetime: "",
      total_marks: "",
      total_seats: "",
      questionIds: [],
      prizeDetailsId: "",
      challengeRequirementId: "",
      ruleId: "",
      eventId: "",
    });
    setSelectedQuestionsDetails([]); // Clear selected question details when creating new
    setShowCreateModal(true);
    setError("");
  };

  // The `handleMultiSelectChange` is now removed as we're no longer using the multi-select dropdown.
  // The `handleRemoveSelectedQuestion` function is still needed and has been adapted
  // to remove from both `selectedQuestionsDetails` and `formData.questionIds`.

  useEffect(() => {
    fetchChallenges();
    fetchQuestions(); // Keep this if other parts of the component need the full list, otherwise can be removed.
    fetchPrizeDetails();
    fetchChallengeRequirements();
    fetchRules();
    fetchEvents(); // Fetch events on component mount
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
                  Event Title
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                challenges &&
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
                      ৳ {challenge.fee}
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
                          onClick={() =>
                            router.push(
                              `http://localhost:3000/challengeResult/${challenge.id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="View Challenge Result"
                        >
                          <Eye size={20} />
                        </button>

                        <button
                          onClick={() => handleEdit(challenge)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto">
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
                    Challenge Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="challenge_type"
                    name="challenge_type"
                    value={formData.challenge_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="practice">Practice</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="mega">Mega</option>
                    <option value="special_event">Special Event</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="fee"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="fee"
                    name="fee"
                    value={formData.fee}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [-moz-appearance:textfield]"
                    placeholder="Enter fee"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quiz_time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quiz Time (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quiz_time"
                    name="quiz_time"
                    value={formData.quiz_time}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [-moz-appearance:textfield]"
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
                    id="deadlineDate"
                    name="deadlineDate"
                    value={formData.deadline.split("T")[0]}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <input
                    type="time"
                    id="deadlineTime"
                    name="deadlineTime"
                    value={
                      formData.deadline.split("T")[1]
                        ? formData.deadline.split("T")[1].substring(0, 5)
                        : ""
                    }
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="start_datetime_date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="start_datetime_date"
                    name="start_datetime_date"
                    value={formData.start_datetime.split("T")[0]}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <input
                    type="time"
                    id="start_datetime_time"
                    name="start_datetime_time"
                    value={
                      formData.start_datetime.split("T")[1]
                        ? formData.start_datetime.split("T")[1].substring(0, 5)
                        : ""
                    }
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end_datetime_date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="end_datetime_date"
                    name="end_datetime_date"
                    value={formData.end_datetime.split("T")[0]}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <input
                    type="time"
                    id="end_datetime_time"
                    name="end_datetime_time"
                    value={
                      formData.end_datetime.split("T")[1]
                        ? formData.end_datetime.split("T")[1].substring(0, 5)
                        : ""
                    }
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_marks"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="total_marks"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [-moz-appearance:textfield]"
                    placeholder="Enter total marks"
                  />
                </div>

                <div>
                  <label
                    htmlFor="total_seats"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [-moz-appearance:textfield]"
                    placeholder="Enter total seats"
                  />
                </div>
                {/* New Question Selection Section */}
                <div>
                  <label
                    htmlFor="questionIds"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Questions <span className="text-red-500">*</span>
                  </label>

                  {/* Display selected questions as tags */}
                  {selectedQuestionsDetails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedQuestionsDetails &&
                        selectedQuestionsDetails.map((q) => (
                          <span
                            key={q.id}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {q.question.substring(0, 30)}...
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800 ml-1"
                              onClick={() => handleRemoveSelectedQuestion(q.id)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* "Add Question" button */}
                  <button
                    type="button"
                    onClick={handleOpenQuestionSelector}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Add Questions
                  </button>

                  {/* Render the QuestionSelector component as a modal/pop-up */}
                  {isQuestionSelectorOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                          <h2 className="text-xl font-semibold">
                            Select Questions
                          </h2>
                          <button
                            onClick={() => setIsQuestionSelectorOpen(false)}
                            className="text-gray-500 hover:text-gray-800 text-2xl"
                          >
                            &times;
                          </button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                          <QuestionSelector
                            onSelect={handleQuestionsSelected}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.questionIds.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">
                      Please select at least one question.
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="prizeDetailsId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prize Details <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="prizeDetailsId"
                    name="prizeDetailsId"
                    value={formData.prizeDetailsId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Prize Details</option>
                    {prizeDetailsOptions.length > 0
                      ? prizeDetailsOptions.map((pd) => (
                          <option key={pd.id} value={pd.id}>
                            ID: {pd.id} -{" "}
                            {Object.values(pd.prize_structure)
                              .flat()
                              .map((p) => p.position)
                              .join(", ")}
                          </option>
                        ))
                      : null}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="challengeRequirementId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Challenge Requirement{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="challengeRequirementId"
                    name="challengeRequirementId"
                    value={formData.challengeRequirementId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Requirement</option>
                    {challengeRequirements.length > 0 ? (
                      challengeRequirements &&
                      challengeRequirements.map((cr) => (
                        <option key={cr.id} value={cr.id}>
                          ID: {cr.id} - Practice Challenges:{" "}
                          {cr.number_of_practice_challenges}
                        </option>
                      ))
                    ) : (
                      <option disabled>No requirements available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ruleId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rule <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ruleId"
                    name="ruleId"
                    value={formData.ruleId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Rule</option>
                    {rules.length > 0 ? (
                      rules &&
                      rules.map((r) => (
                        <option key={r.id} value={r.id}>
                          ID: {r.id} - {r.title} ({r.challenge_type})
                        </option>
                      ))
                    ) : (
                      <option disabled>No rules available</option>
                    )}
                  </select>
                </div>

                {formData.challenge_type === "special_event" && (
                  <>
                    <hr className="col-span-full my-4" />
                    <h3 className="col-span-full text-lg font-semibold text-gray-800">
                      Special Event Details
                    </h3>
                    <div>
                      <label
                        htmlFor="eventId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Event <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="eventId"
                        name="eventId"
                        value={formData.eventId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Event</option>
                        {events.length > 0 ? (
                          events &&
                          events.map((event) => (
                            <option key={event.id} value={event.id}>
                              ID: {event.id} - {event.title}
                            </option>
                          ))
                        ) : (
                          <option disabled>No events available</option>
                        )}
                      </select>
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
                  </>
                )}

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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto">
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
                    Challenge Type <span className="text-red-500">*</span>
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
                    <option value="practice">Practice</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="mega">Mega</option>
                    <option value="special_event">Special Event</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="fee"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fee <span className="text-red-500">*</span>
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
                    Quiz Time (minutes) <span className="text-red-500">*</span>
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
                    Start Date <span className="text-red-500">*</span>
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
                    End Date <span className="text-red-500">*</span>
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
                    Total Marks <span className="text-red-500">*</span>
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
                    Total Seats <span className="text-red-500">*</span>
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

                {/* Question Selection Section for Edit Modal */}
                <div>
                  <label
                    htmlFor="questionIds"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Questions <span className="text-red-500">*</span>
                  </label>

                  {/* Display selected questions as tags */}
                  {selectedQuestionsDetails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedQuestionsDetails &&
                        selectedQuestionsDetails.map((q) => (
                          <span
                            key={q.id}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {q.question.substring(0, 30)}...
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800 ml-1"
                              onClick={() => handleRemoveSelectedQuestion(q.id)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* "Add Question" button */}
                  <button
                    type="button"
                    onClick={handleOpenQuestionSelector} // Re-use the same handler
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Add Questions
                  </button>

                  {formData.questionIds.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">
                      Please select at least one question.
                    </p>
                  )}
                </div>

                {/* Render the QuestionSelector component as a modal/pop-up (place this outside your form but within your ChallengeManagement component's render method) */}
                {/* This part remains the same as in your previous implementation and should be placed
    once within the ChallengeManagement component, not duplicated for create and edit forms.
    It's controlled by `isQuestionSelectorOpen` state. */}
                {isQuestionSelectorOpen && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-semibold">
                          Select Questions
                        </h2>
                        <button
                          onClick={() => setIsQuestionSelectorOpen(false)}
                          className="text-gray-500 hover:text-gray-800 text-2xl"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="flex-grow overflow-y-auto">
                        <QuestionSelector onSelect={handleQuestionsSelected} />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="prizeDetailsId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prize Details <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="prizeDetailsId"
                    name="prizeDetailsId"
                    value={formData.prizeDetailsId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Prize Details</option>
                    {prizeDetailsOptions.length > 0 ? (
                      prizeDetailsOptions.map((pd) => (
                        <option key={pd.id} value={pd.id}>
                          ID: {pd.id} -{" "}
                          {Object.values(pd.prize_structure)
                            .flat()
                            .map((p) => p.position)
                            .join(", ")}
                        </option>
                      ))
                    ) : (
                      <option disabled>No prize details available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="challengeRequirementId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Challenge Requirement{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="challengeRequirementId"
                    name="challengeRequirementId"
                    value={formData.challengeRequirementId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Requirement</option>
                    {challengeRequirements.length > 0 ? (
                      challengeRequirements &&
                      challengeRequirements.map((cr) => (
                        <option key={cr.id} value={cr.id}>
                          ID: {cr.id} - Practice Challenges:{" "}
                          {cr.number_of_practice_challenges}
                        </option>
                      ))
                    ) : (
                      <option disabled>No requirements available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ruleId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rule <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ruleId"
                    name="ruleId"
                    value={formData.ruleId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Rule</option>
                    {rules.length > 0 ? (
                      rules &&
                      rules.map((r) => (
                        <option key={r.id} value={r.id}>
                          ID: {r.id} - {r.title} ({r.challenge_type})
                        </option>
                      ))
                    ) : (
                      <option disabled>No rules available</option>
                    )}
                  </select>
                </div>

                {formData.challenge_type === "special_event" && (
                  <>
                    <hr className="col-span-full my-4" />
                    <h3 className="col-span-full text-lg font-semibold text-gray-800">
                      Special Event Details
                    </h3>
                    <div>
                      <label
                        htmlFor="eventId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Event <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="eventId"
                        name="eventId"
                        value={formData.eventId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Event</option>
                        {events.length > 0 ? (
                          events &&
                          events.map((event) => (
                            <option key={event.id} value={event.id}>
                              ID: {event.id} - {event.title}
                            </option>
                          ))
                        ) : (
                          <option disabled>No events available</option>
                        )}
                      </select>
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
                  </>
                )}

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

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirm Deletion
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700">
                  Are you sure you want to delete the challenge{" "}
                  <span className="font-semibold">
                    {selectedChallenge?.specialEventDetails?.title ||
                      selectedChallenge?.id}
                  </span>
                  {"? This action cannot be undone."}
                </p>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteChallenge}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeManagement;
