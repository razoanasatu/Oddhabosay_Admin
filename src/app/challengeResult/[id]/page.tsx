"use client";

import { baseUrl } from "@/utils/constant";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface Result {
  userId: number;
  userName: string;
  userImage: string;
  score: number;
  rank: number;
  position: string;
  prize_money: number;
  prize_money_distribution_status: boolean;
}

interface ChallengeGroup {
  challengeId: number;
  challengeName: string;
  startDate: string | null;
  endDate: string | null;
  results: Result[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    monthly: ChallengeGroup[];
    weekly: ChallengeGroup[];
    mega: ChallengeGroup[];
    special_event: ChallengeGroup[];
  };
}

export default function ChallengeResultPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ChallengeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/challenges/all-challenges-result`
        );
        const json: ApiResponse = await res.json();

        const allChallenges = [
          ...json.data.monthly,
          ...json.data.weekly,
          ...json.data.mega,
          ...json.data.special_event,
        ];

        const filtered = allChallenges.filter(
          (item) => item.challengeId.toString() === id
        );
        setData(filtered);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResults();
  }, [id]);

  const handleDistributePrize = async () => {
    setDistributing(true);
    setMessage("");

    try {
      const res = await fetch(
        `${baseUrl}/api/challenges/${id}/distribute-prize-money`,
        {
          method: "POST",
        }
      );

      const json = await res.json();

      if (json.success) {
        setMessage("✅ Prize money distribution successful.");
      } else {
        setMessage("❌ Failed to distribute prize money.");
      }
    } catch (err) {
      setMessage("❌ Error distributing prize money.");
      console.error(err);
    } finally {
      setDistributing(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!data.length) return;

    const rows = data.flatMap((challenge) =>
      challenge.results.map((result) => ({
        Challenge: challenge.challengeName,
        "User Name": result.userName,
        "User ID": result.userId,
        Score: result.score,
        Rank: result.rank,
        Position: result.position,
        "Prize Money": result.prize_money,
        "Distribution Status": result.prize_money_distribution_status
          ? "Distributed"
          : "Pending",
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Challenge Results");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `challenge-results-${id}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (!data.length) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Challenge Results - ID: ${id}`, 14, 16);

    const tableData = data.flatMap((challenge) =>
      challenge.results.map((result) => [
        challenge.challengeName,
        result.userName,
        result.userId,
        result.score,
        result.rank,
        result.position,
        `৳ ${result.prize_money}`,
        result.prize_money_distribution_status ? "Distributed" : "Pending",
      ])
    );

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Challenge",
          "User Name",
          "User ID",
          "Score",
          "Rank",
          "Position",
          "Prize Money",
          "Status",
        ],
      ],
      body: tableData,
    });

    doc.save(`challenge-results-${id}.pdf`);
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading challenge result...</p>;
  }

  if (!data.length) {
    return (
      <p className="p-6 text-gray-600">
        No results found for Challenge ID: {id}
      </p>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">Challenge Results - ID: {id}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDistributePrize}
            disabled={distributing}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {distributing ? "Distributing..." : "Prize Money Distribute"}
          </button>
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-100 p-2 rounded">
          {message}
        </div>
      )}

      {data.map((challenge) => (
        <div key={challenge.challengeId} className="mb-8">
          <h2 className="text-lg font-semibold mb-2 capitalize">
            {challenge.challengeName} Challenge
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {challenge.startDate &&
              `Start: ${new Date(challenge.startDate).toLocaleString()} | `}
            {challenge.endDate &&
              `End: ${new Date(challenge.endDate).toLocaleString()}`}
          </p>

          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Score</th>
                <th className="text-left px-4 py-2">Rank</th>
                <th className="text-left px-4 py-2">Position</th>
                <th className="text-left px-4 py-2">Prize Money</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {challenge.results.map((result) => (
                <tr key={result.userId} className="border-t">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <img
                      src={result.userImage}
                      alt={result.userName}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{result.userName}</span>
                  </td>
                  <td className="px-4 py-2">{result.score}</td>
                  <td className="px-4 py-2">{result.rank}</td>
                  <td className="px-4 py-2">{result.position}</td>
                  <td className="px-4 py-2">৳ {result.prize_money}</td>
                  <td className="px-4 py-2">
                    {result.prize_money_distribution_status ? (
                      <span className="text-green-600">Distributed</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
