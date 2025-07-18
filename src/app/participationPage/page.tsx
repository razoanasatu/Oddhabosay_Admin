"use client";
import { baseUrl } from "@/utils/constant";
import {
  Archive,
  Calendar,
  RefreshCcw,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Define ParticipationEntry type properly for clarity and type safety
interface ParticipationEntry {
  user: {
    id: string;
    name: string;
  };
  participation: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    weeklyChallengeCount: number;
    monthlyChallengeCount: number;
    megaChallengeCount: number;
    special_eventChallengeCount: number;
    practiceChallengeCount: number;
  };
}

interface EligibilityRequirement {
  weekly: number;
  monthly: number;
  mega: number;
  special_event: number;
  practice: number;
}

// Added new interface for winner data
interface Winner {
  id: number;
  userId: number;
  year: number;
  createdAt: string;
}

const ParticipationPage: React.FC = () => {
  const [data, setData] = useState<ParticipationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityRequirement | null>(
    null
  );
  // Added state for winners and to toggle archive view
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/win-laptop/participation`);
      if (!response.ok) {
        throw new Error("Failed to fetch participant data.");
      }
      const json = await response.json();
      setData(json.data || []);
      toast.success("Participant data fetched successfully!");
    } catch (err: any) {
      setError(err.message || "Error fetching data.");
      toast.error(err.message || "Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(
        `${baseUrl}/api/win-laptop-eligibility/${currentYear}`
      );
      const json = await res.json();
      if (res.ok) {
        const e = json.data;
        setEligibility({
          weekly: e.weekly,
          monthly: e.monthly,
          mega: e.mega,
          special_event: e.special_event,
          practice: e.practice,
        });
      } else {
        throw new Error(json.message || "Failed to load eligibility data.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error loading eligibility data.");
    }
  };

  // New function to fetch winners
  const fetchWinners = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(
        `${baseUrl}/api/win-laptop/winners/${currentYear}`
      );
      const json = await res.json();
      if (res.ok) {
        setWinners(json.data || []);
      } else {
        throw new Error(json.message || "Failed to fetch winners data.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error fetching winners.");
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchEligibility();
    fetchWinners(); // Call the new fetchWinners function
  }, []);

  const handleReset = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all participation data? This action is irreversible."
      )
    ) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${baseUrl}/api/win-laptop/resetParticipationData`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        const json = await res.json();

        if (res.ok) {
          toast.success(
            json.message || "Participation data reset successfully!"
          );
          fetchParticipants();
          fetchWinners(); // Refetch winners after reset
        } else {
          throw new Error(json.message || "Failed to reset data.");
        }
      } catch (err: any) {
        setError(err.message || "Error resetting data.");
        toast.error(err.message || "Error resetting data.");
      } finally {
        setLoading(false);
      }
    }
  };

  // New function to handle archiving a winner
  const handleArchive = async (userId: string) => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(`${baseUrl}/api/win-laptop/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, year: currentYear }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Participant archived successfully!");
        fetchParticipants(); // Refresh participants list
        fetchWinners(); // Refresh winners list
      } else {
        throw new Error(json.message || "Failed to archive participant.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error archiving participant.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (
    participation: ParticipationEntry["participation"],
    eligibility: EligibilityRequirement
  ) => {
    const progressMap = {
      weekly: participation.weeklyChallengeCount / eligibility.weekly,
      monthly: participation.monthlyChallengeCount / eligibility.monthly,
      mega: participation.megaChallengeCount / eligibility.mega,
      special_event:
        participation.special_eventChallengeCount / eligibility.special_event,
      practice: participation.practiceChallengeCount / eligibility.practice,
    };

    const normalizedProgress = Object.values(progressMap).map((p) =>
      isFinite(p) ? Math.min(p, 1) : 1
    );

    const total = normalizedProgress.reduce((acc, val) => acc + val, 0);
    return Math.round((total / normalizedProgress.length) * 100);
  };

  // Filter out winners from the main data list
  const filteredData = data.filter(
    (entry) =>
      !winners.some((winner) => winner.userId === parseInt(entry.user.id))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0 flex items-center gap-2">
            <Trophy size={36} className="text-yellow-500" />
            Competition Participants
          </h1>
          <div className="flex gap-4">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => setShowArchive(!showArchive)}
              disabled={loading}
            >
              <Archive size={20} strokeWidth={2.5} />
              {showArchive ? "Show Participants" : "Show Archive"}
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleReset}
              disabled={loading}
            >
              <RefreshCcw size={20} strokeWidth={2.5} />
              Reset Data
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12 text-purple-600">
            <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
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
            <span className="text-lg font-medium">Loading participants...</span>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg mb-6 flex items-center shadow-md animate-fade-in"
            role="alert"
          >
            <span className="h-5 w-5 mr-3">❌</span>
            <div>
              <p className="font-semibold">Error!</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Participants Table (Visible if not showing archive) */}
        {!loading && !showArchive && filteredData.length > 0 && (
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <User size={16} className="inline mr-1" />
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <Calendar size={16} className="inline mr-1" />
                    Weekly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <Calendar size={16} className="inline mr-1" />
                    Monthly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <Calendar size={16} className="inline mr-1" />
                    Mega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <Sparkles size={16} className="inline mr-1" />
                    Special
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <Calendar size={16} className="inline mr-1" />
                    Practice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.map((entry) => (
                  <tr
                    key={entry.user.id}
                    className="hover:bg-purple-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">
                      {entry.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {entry.participation.weeklyChallengeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {entry.participation.monthlyChallengeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {entry.participation.megaChallengeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {entry.participation.special_eventChallengeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {entry.participation.practiceChallengeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        entry.participation.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {eligibility ? (
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-green-500 h-4 text-xs text-white text-center"
                            style={{
                              width: `${calculateProgress(
                                entry.participation,
                                eligibility
                              )}%`,
                            }}
                          >
                            {calculateProgress(
                              entry.participation,
                              eligibility
                            )}
                            %
                          </div>
                        </div>
                      ) : (
                        "Loading..."
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleArchive(entry.user.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        title="Archive Participant"
                      >
                        <Archive size={16} />
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Archive Table (Visible if showing archive) */}
        {!loading && showArchive && (
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Archive size={24} className="text-gray-500" />
              Archived Winners
            </h2>
            {winners.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      <User size={16} className="inline mr-1" />
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Year Won
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {winners.map((winner) => {
                    const participant = data.find(
                      (p) => parseInt(p.user.id) === winner.userId
                    );
                    return (
                      <tr key={winner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant?.user.name ||
                            `User ID: ${winner.userId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {winner.year}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-gray-500 italic">
                <p className="text-lg">No winners have been archived yet.</p>
              </div>
            )}
          </div>
        )}

        {/* No data message */}
        {!loading &&
          (showArchive ? winners.length === 0 : filteredData.length === 0) &&
          !error && (
            <div className="py-12 text-center text-gray-500 italic">
              <p className="text-lg">
                {showArchive
                  ? "No winners have been archived yet."
                  : "No participants found for this competition."}
              </p>
              <p className="text-sm mt-2">
                Check the API connection or add new entries.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default ParticipationPage;
