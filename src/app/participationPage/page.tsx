"use client";

import { baseUrl } from "@/utils/constant";
import React, { useEffect, useState } from "react";

interface ParticipationEntry {
  user: {
    id: number;
    name: string;
  };
  participation: {
    id: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    weeklyChallengeCount: number;
    monthlyChallengeCount: number;
    megaChallengeCount: number;
    special_eventChallengeCount: number;
    practiceChallengeCount: number;
  };
}

const ParticipationPage: React.FC = () => {
  const year = new Date().getFullYear();
  const [data, setData] = useState<ParticipationEntry[]>([]);

  const fetchParticipants = () => {
    fetch(`${baseUrl}/api/win-laptop/participation`)
      .then((res) => res.json())
      .then((json) => setData(json.data || []));
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleReset = async () => {
    if (window.confirm("Reset participation data?")) {
      const res = await fetch(
        `${baseUrl}/api/win-laptop/resetParticipationData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year }),
        }
      );
      const json = await res.json();
      alert(json.message);
      fetchParticipants();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          👥 Participants ({year})
        </h2>
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
          onClick={handleReset}
        >
          🔄 Reset Participation
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No participants found.
        </p>
      ) : (
        <ul className="space-y-6">
          {data.map((entry) => (
            <li
              key={entry.user.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                👤 {entry.user.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">Weekly:</span>{" "}
                  {entry.participation.weeklyChallengeCount}
                </div>
                <div>
                  <span className="font-medium">Monthly:</span>{" "}
                  {entry.participation.monthlyChallengeCount}
                </div>
                <div>
                  <span className="font-medium">Mega:</span>{" "}
                  {entry.participation.megaChallengeCount}
                </div>
                <div>
                  <span className="font-medium">Special Events:</span>{" "}
                  {entry.participation.special_eventChallengeCount}
                </div>
                <div>
                  <span className="font-medium">Practice:</span>{" "}
                  {entry.participation.practiceChallengeCount}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(entry.participation.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(entry.participation.updatedAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParticipationPage;
