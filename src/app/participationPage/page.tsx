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
    <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          👥 Participants {/*({year}) */}
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Weekly</th>
                <th className="px-4 py-2 text-left font-semibold">Monthly</th>
                <th className="px-4 py-2 text-left font-semibold">Mega</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Special Events
                </th>
                <th className="px-4 py-2 text-left font-semibold">Practice</th>
                <th className="px-4 py-2 text-left font-semibold">Created</th>
                <th className="px-4 py-2 text-left font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
              {data.map((entry) => (
                <tr
                  key={entry.user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 font-medium text-blue-700 dark:text-blue-300">
                    👤 {entry.user.name}
                  </td>
                  <td className="px-4 py-3">
                    {entry.participation.weeklyChallengeCount}
                  </td>
                  <td className="px-4 py-3">
                    {entry.participation.monthlyChallengeCount}
                  </td>
                  <td className="px-4 py-3">
                    {entry.participation.megaChallengeCount}
                  </td>
                  <td className="px-4 py-3">
                    {entry.participation.special_eventChallengeCount}
                  </td>
                  <td className="px-4 py-3">
                    {entry.participation.practiceChallengeCount}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(entry.participation.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(entry.participation.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParticipationPage;
