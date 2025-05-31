"use client";
import { baseUrl } from "@/utils/constant";
import React, { useEffect, useState } from "react";

type Question = {
  id: number;
  question: string;
};

type PrizePosition = {
  position: string;
  prize_money: number;
  user_number: number;
  limit: number;
};

type PrizeDetail = {
  id: number;
  prize_positions: PrizePosition[];
  global_board: boolean;
  monthly_eligibility: number;
  weekly_eligibility: number;
  createdAt: string;
  updatedAt: string;
};

type ChallengeRequirement = {
  id: number;
  title: string;
};

type Rule = {
  id: number;
  title: string;
};

type SpecialEvent = {
  id: number;
  title: string;
};

export default function CreateChallenge() {
  interface ApiResponse<T> {
    success: boolean;
    data: T;
  }

  const [challengeType, setChallengeType] = useState("weekly");
  const [fee, setFee] = useState<number>(0);
  const [deadline, setDeadline] = useState("");
  const [activeStatus, setActiveStatus] = useState(true);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prizeDetailsIds, setPrizeDetailsIds] = useState<number[]>([]);
  const [prizeDetails, setPrizeDetails] = useState<PrizeDetail[]>([]);
  const [challengeRequirementId, setChallengeRequirementId] = useState<
    number | ""
  >("");
  const [challengeRequirements, setChallengeRequirements] = useState<
    ChallengeRequirement[]
  >([]);
  const [ruleId, setRuleId] = useState<number | "">("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [eventCode, setEventCode] = useState("");
  const [eventId, setEventId] = useState<number | "">("");
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [totalSeats, setTotalSeats] = useState<number>(0);
  const [quizTime, setQuizTime] = useState<number>(0);

  // Fetch APIs on mount
  useEffect(() => {
    fetch(`${baseUrl}/api/question-bank`)
      .then((res) => res.json())
      .then((data: ApiResponse<Question[]>) => {
        if (data.success) setQuestions(data.data);
      });

    fetch(`${baseUrl}/api/prize-details`)
      .then((res) => res.json())
      .then((data: ApiResponse<PrizeDetail[]>) => {
        if (data.success) setPrizeDetails(data.data);
      });

    fetch(`${baseUrl}/api/challenge-requirement`)
      .then((res) => res.json())
      .then((data: ApiResponse<ChallengeRequirement[]>) => {
        if (data.success) setChallengeRequirements(data.data);
      });

    fetch(`${baseUrl}/api/challenge-rules`)
      .then((res) => res.json())
      .then((data: ApiResponse<Rule[]>) => {
        if (data.success) setRules(data.data);
      });

    fetch(`${baseUrl}/api/special-event`)
      .then((res) => res.json())
      .then((data: ApiResponse<SpecialEvent[]>) => {
        if (data.success) setEvents(data.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (challengeType === "special_event" && (!eventCode || !eventId)) {
      alert("Event Code and Event ID are required for Special Event.");
      return;
    }

    const payload = {
      challenge_type: challengeType,
      fee,
      deadline,
      active_status: activeStatus,
      questionIds,
      prizeDetailsIds,
      challengeRequirementId,
      ruleId,
      event_code: challengeType === "special_event" ? eventCode : undefined,
      eventId: challengeType === "special_event" ? eventId : undefined,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      total_marks: totalMarks,
      total_seats: totalSeats,
      quiz_time: quizTime,
    };

    try {
      const res = await fetch(`${baseUrl}/api/challenges/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Challenge created successfully.");
      } else {
        alert("Failed to create challenge.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Create Challenge</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded shadow"
      >
        {/* Challenge Type */}
        <div>
          <label className="block mb-1 font-medium">Challenge Type</label>
          <select
            value={challengeType}
            onChange={(e) => setChallengeType(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="mega">Mega</option>
            <option value="special_event">Special Event</option>
          </select>
        </div>

        {/* Fee */}
        <div>
          <label className="block mb-1 font-medium">Fee</label>
          <input
            type="number"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
            min={0}
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block mb-1 font-medium">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={activeStatus}
            onChange={(e) => setActiveStatus(e.target.checked)}
            id="activeStatus"
          />
          <label htmlFor="activeStatus" className="font-medium">
            Active Status
          </label>
        </div>
        {/* Select Questions - Custom Multi-Select */}
        <div>
          <label className="block mb-1 font-medium">Select Questions</label>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {questionIds.map((id) => {
              const question = questions.find((q) => q.id === id);
              return (
                <span
                  key={id}
                  className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                >
                  {question?.question || `Question ${id}`}
                  <button
                    type="button"
                    onClick={() =>
                      setQuestionIds(questionIds.filter((qId) => qId !== id))
                    }
                    className="ml-2 text-purple-600 hover:text-purple-900"
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>

          {/* Dropdown */}
          <select
            value=""
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              if (!questionIds.includes(selectedId)) {
                setQuestionIds([...questionIds, selectedId]);
              }
            }}
            className="border border-gray-300 rounded p-2 w-full max-w-lg"
          >
            <option value="" disabled>
              Select a question
            </option>
            {questions
              .filter((q) => !questionIds.includes(q.id))
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.question}
                </option>
              ))}
          </select>
        </div>

        {/* Prize Details (Single-select but stored as array) */}
        <div>
          <label className="block mb-1 font-medium">Prize Details</label>
          <select
            value={prizeDetailsIds.length > 0 ? String(prizeDetailsIds[0]) : ""}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setPrizeDetailsIds([selectedId]); // Wrap in array
            }}
            className="border border-gray-300 rounded p-2 w-full max-w-lg"
          >
            <option value="" disabled>
              Select a prize detail
            </option>
            {prizeDetails.map((p, idx) => (
              <option key={idx} value={p.id}>
                Prize Detail {p.id}
              </option>
            ))}
          </select>
        </div>

        {/* Challenge Requirement */}
        <div>
          <label className="block mb-1 font-medium">
            Challenge Requirement
          </label>
          <select
            value={
              challengeRequirementId === ""
                ? ""
                : String(challengeRequirementId)
            }
            onChange={(e) => setChallengeRequirementId(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
          >
            <option value="" disabled>
              Select requirement
            </option>
            {challengeRequirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.title || `Requirement ${req.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Rule */}
        <div>
          <label className="block mb-1 font-medium">Rule</label>
          <select
            value={ruleId === "" ? "" : String(ruleId)}
            onChange={(e) => setRuleId(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
          >
            <option value="" disabled>
              Select rule
            </option>
            {rules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.title || `Rule ${rule.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Special Event Fields */}
        {challengeType === "special_event" && (
          <>
            <div>
              <label className="block mb-1 font-medium">Event Code</label>
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full max-w-sm"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Event</label>
              <select
                value={eventId === "" ? "" : String(eventId)}
                onChange={(e) => setEventId(Number(e.target.value))}
                className="border border-gray-300 rounded p-2 w-full max-w-sm"
              >
                <option value="" disabled>
                  Select event
                </option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Start DateTime */}
        <div>
          <label className="block mb-1 font-medium">Start Date & Time</label>
          <input
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
          />
        </div>

        {/* End DateTime */}
        <div>
          <label className="block mb-1 font-medium">End Date & Time</label>
          <input
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
          />
        </div>

        {/* Total Marks */}
        <div>
          <label className="block mb-1 font-medium">Total Marks</label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
            min={0}
          />
        </div>

        {/* Total Seats */}
        <div>
          <label className="block mb-1 font-medium">Total Seats</label>
          <input
            type="number"
            value={totalSeats}
            onChange={(e) => setTotalSeats(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
            min={0}
          />
        </div>

        {/* Quiz Time (minutes) */}
        <div>
          <label className="block mb-1 font-medium">Quiz Time (minutes)</label>
          <input
            type="number"
            value={quizTime}
            onChange={(e) => setQuizTime(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 w-full max-w-sm"
            min={0}
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Create Challenge
          </button>
        </div>
      </form>
    </div>
  );
}
