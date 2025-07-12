"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { baseUrl } from "@/utils/constant";
import {
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Filter,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = `${baseUrl}/api/global-board`;
const CHALLENGES_API_URL = `${baseUrl}/api/challenges/all-challenges-result`;
const GLOBAL_BOARD_RANKINGS_API_URL = `${baseUrl}/api/challenges/global-board-rankings`;

type User = {
  userId: number;
  userName: string;
  userImage: string;
  totalPoints: number;
  position: string;
  prize_money: number;
  monthly_eligibility: number;
  weekly_eligibility: number;
  numericRank: number;
  eligibilityAchievedAt: string | null;
  monthlySubmitTime: string | null;
  weeklySubmitTime: string | null;
  practicePassed: number;
  previousRank: number | null;
};

type SortingItem = {
  userId: number;
  userName: string;
  image: string;
  position: number;
  totalPoints?: number;
  monthlySubmitTime?: string | null;
  weeklySubmitTime?: string | null;
  practicePassed?: number;
  previousRank?: number | null;
};

type Sorting = {
  byTotalPoints: SortingItem[];
  byMonthlySubmitTime: SortingItem[];
  byWeeklySubmitTime: SortingItem[];
  byPracticePassed: SortingItem[];
  byPreviousRank: SortingItem[];
};

type ChallengeResult = {
  userId: number;
  userName: string;
  userImage: string;
  score: number;
  rank: number;
  position: string;
  prize_money: number;
  prize_money_distribution_status: boolean;
  lastSameTypeChallenge: string | null;
  monthlyPracticeCountBefore: number;
  eligibilityDate: string | null;
};

type Challenge = {
  challengeId: number;
  challengeType: string;
  startDate: string;
  endDate: string;
  results: ChallengeResult[]; // ✅ Correct type
};

type AllChallengesResult = {
  monthly: Challenge[];
  mega: Challenge[];
  special_event: Challenge[];
  weekly: Challenge[];
  [key: string]: Challenge[]; // Index signature
};

const downloadCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
};

const downloadPDF = (data: any[], columns: string[], filename: string) => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [columns],
    body: data.map((row) => columns.map((col) => row[col] ?? "N/A")),
  });
  doc.save(`${filename}.pdf`);
};

export default function Globalboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultFinalized, setResultFinalized] = useState(false);

  const [monthlyEligibility, setMonthlyEligibility] = useState(0);
  const [weeklyEligibility, setWeeklyEligibility] = useState(0);
  const [sorting, setSorting] = useState<Sorting | null>(null);

  const [showFilterInputs, setShowFilterInputs] = useState(false);
  const [inputMonth, setInputMonth] = useState<number | "">("");
  const [inputYear, setInputYear] = useState<number | "">("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSortingModal, setShowSortingModal] = useState(false);

  // New state for challenge type filter
  const [challengeTypes, setChallengeTypes] = useState<string[]>([]);
  const [selectedChallengeType, setSelectedChallengeType] =
    useState<string>("");
  const [allChallengesData, setAllChallengesData] =
    useState<AllChallengesResult | null>(null);

  // New state for specific challenge selection
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>(
    []
  );
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | "">(
    ""
  );

  // New state for date range filtering for challenges
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // New state for reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState(
    "🏆 This month's global leaderboard is finalized! Congratulations to all the winners!"
  );

  const rowsPerPage = 10;
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = users.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    fetchCurrentBoard();
    fetchAllChallengeTypes();
  }, []);

  const fetchCurrentBoard = () => {
    setSelectedChallengeType(""); // Reset challenge type filter
    setSelectedChallengeId(""); // Reset specific challenge
    setStartDate(""); // Reset date range
    setEndDate(""); // Reset date range
    setInputMonth(""); // Reset month/year
    setInputYear(""); // Reset month/year
    setShowFilterInputs(false); // Hide month/year inputs

    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.users) {
          setUsers(data.data.users);
          setMonthlyEligibility(data.data.monthly_eligibility || 0);
          setWeeklyEligibility(data.data.weekly_eligibility || 0);
          setSorting(data.data.sorting || null);
          setResultFinalized(data.result_finalization === true);
          setCurrentPage(1);
        } else {
          setUsers([]);
          setMonthlyEligibility(0);
          setWeeklyEligibility(0);
          setSorting(null);
          setResultFinalized(false);
        }
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));
  };

  const fetchPreviousGlobalBoard = (month: number, year: number) => {
    setSelectedChallengeType(""); // Clear challenge type filter
    setSelectedChallengeId(""); // Clear specific challenge
    setStartDate(""); // Clear date range
    setEndDate(""); // Clear date range

    fetch(`${GLOBAL_BOARD_RANKINGS_API_URL}?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.users) {
          setUsers(data.data.users);
          setMonthlyEligibility(data.data.monthly_eligibility || 0);
          setWeeklyEligibility(data.data.weekly_eligibility || 0);
          setSorting(data.data.sorting || null);
          setResultFinalized(data.result_finalization === true); // Assuming this API also returns finalization status
          setCurrentPage(1);
        } else {
          setUsers([]);
          setMonthlyEligibility(0);
          setWeeklyEligibility(0);
          setSorting(null);
          setResultFinalized(false);
          alert("No data found for the selected month and year.");
        }
      })
      .catch((err) => {
        console.error("Error fetching filtered board:", err);
        alert("Failed to fetch filtered results.");
      });
  };

  const fetchAllChallengeTypes = () => {
    fetch(CHALLENGES_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAllChallengesData(data.data);
          const types = Object.keys(data.data);
          setChallengeTypes(types);
        }
      })
      .catch((err) => console.error("Error fetching challenge types:", err));
  };

  const handleChallengeTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const type = event.target.value;
    setSelectedChallengeType(type);
    setSelectedChallengeId(""); // Clear any existing specific challenge
    setStartDate("");
    setEndDate("");
    setInputMonth("");
    setInputYear("");
    setShowFilterInputs(false);
    setCurrentPage(1);

    if (type === "") {
      // Go back to Global Board (Current)
      fetchCurrentBoard();
      setAvailableChallenges([]);
      return;
    }

    const challengesOfType = allChallengesData?.[type] ?? [];

    if (challengesOfType.length > 0) {
      // Sort by endDate descending to get latest challenge
      const sorted = [...challengesOfType].sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
      const latest = sorted[0];

      setAvailableChallenges(sorted); // Save all challenges
      setSelectedChallengeId(latest.challengeId); // Set latest as selected
      displayChallengeResults(latest.results as ChallengeResult[]);
    } else {
      setAvailableChallenges([]);
      setUsers([]);
    }
  };

  const handleSpecificChallengeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const challengeId = Number(event.target.value);
    setSelectedChallengeId(challengeId);
    setCurrentPage(1); // Reset to first page on specific challenge change

    // ❌ Do NOT reset the date range here

    if (challengeId === 0) {
      // If "Select a Challenge" is chosen, clear results
      setUsers([]);
      return;
    }

    const selectedChallenge = availableChallenges.find(
      (challenge) => challenge.challengeId === challengeId
    );

    if (selectedChallenge) {
      displayChallengeResults(
        selectedChallenge.results as unknown as ChallengeResult[]
      ); // Cast to ChallengeResult[]
    } else {
      setUsers([]);
    }
  };

  const handleDateRangeFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates for filtering.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    setCurrentPage(1);
    setSelectedChallengeId(""); // Clear specific challenge selection when applying date range

    const filteredChallenges = availableChallenges.filter((challenge) => {
      const challengeStartDate = new Date(challenge.startDate);
      const challengeEndDate = new Date(challenge.endDate);
      const filterStartDate = new Date(startDate);
      const filterEndDate = new Date(endDate);

      // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
      return (
        challengeStartDate <= filterEndDate &&
        challengeEndDate >= filterStartDate
      );
    });

    if (filteredChallenges.length > 0) {
      const combinedResultsMap = new Map<number, ChallengeResult>();

      filteredChallenges.forEach((challenge) => {
        (challenge.results as unknown as ChallengeResult[]).forEach(
          (result) => {
            // Cast to ChallengeResult[]
            if (combinedResultsMap.has(result.userId)) {
              const existingResult = combinedResultsMap.get(result.userId)!;
              // Example: Sum scores if a user participated in multiple challenges in the range
              existingResult.score += result.score;
              // You might need more sophisticated logic here (e.g., take best score, average, etc.)
            } else {
              combinedResultsMap.set(result.userId, { ...result });
            }
          }
        );
      });

      // Convert map values to array, sort by combined score, and re-rank
      const finalUsers = Array.from(combinedResultsMap.values()).sort(
        (a, b) => b.score - a.score
      );

      const mappedUsers: User[] = finalUsers.map((result, index) => ({
        userId: result.userId,
        userName: result.userName,
        userImage: result.userImage,
        totalPoints: result.score,
        position: `${index + 1}${getOrdinalSuffix(index + 1)}`, // Recalculate position
        prize_money: result.prize_money, // Keep original prize or adjust if combining logic changes it
        monthly_eligibility: result.monthlyPracticeCountBefore,
        weekly_eligibility: 0,
        numericRank: index + 1,
        eligibilityAchievedAt: result.eligibilityDate,
        monthlySubmitTime: null,
        weeklySubmitTime: null,
        practicePassed: result.monthlyPracticeCountBefore,
        previousRank: null,
      }));
      setUsers(mappedUsers);
    } else {
      setUsers([]);
      alert(
        "No challenges found within the selected date range for this type."
      );
    }
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const displayChallengeResults = (results: ChallengeResult[]) => {
    const mappedUsers: User[] = results.map((result) => ({
      userId: result.userId,
      userName: result.userName,
      userImage: result.userImage,
      totalPoints: result.score, // Using score as totalPoints for challenge results
      position: result.position,
      prize_money: result.prize_money,
      monthly_eligibility: result.monthlyPracticeCountBefore, // Using monthlyPracticeCountBefore as monthly_eligibility
      weekly_eligibility: 0, // Not available in this API, set to 0 or null
      numericRank: result.rank,
      eligibilityAchievedAt: result.eligibilityDate,
      monthlySubmitTime: null, // Not available in this API
      weeklySubmitTime: null, // Not available in this API
      practicePassed: result.monthlyPracticeCountBefore, // Assuming this is the relevant "practicePassed"
      previousRank: null, // Not available in this API
    }));
    setUsers(mappedUsers);
  };

  const confirmResetBoard = async () => {
    try {
      const requestBody: { result_finalization: boolean; message?: string } = {
        result_finalization: true,
      };
      if (resetMessage.trim() !== "") {
        requestBody.message = resetMessage.trim();
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (result.success) {
        alert("Board has been reset and prizes distributed.");
        fetchCurrentBoard();
      } else {
        alert("Reset failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error resetting board:", err);
      alert("An error occurred while resetting the board.");
    } finally {
      setShowResetModal(false); // Close the modal regardless of success/failure
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getColumnsForSortingKey = (key: string): string[] => {
    switch (key) {
      case "byTotalPoints":
        return ["position", "userName", "totalPoints"];
      case "byPracticePassed":
        return ["position", "userName", "practicePassed"];
      case "byMonthlySubmitTime":
        return ["position", "userName", "monthlySubmitTime"];
      case "byWeeklySubmitTime":
        return ["position", "userName", "weeklySubmitTime"];
      case "byPreviousRank":
        return ["position", "userName", "previousRank"];
      default:
        return ["position", "userName"];
    }
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0">
          LeaderBoard
        </h1>

        <div className="flex gap-2 mt-2 flex-wrap justify-end">
          <Button
            className="bg-green-700 text-white hover:bg-green-800 transition-colors duration-200"
            onClick={() => downloadCSV(users, "leaderboard")}
          >
            Download CSV
          </Button>
          <Button
            className="bg-red-700 text-white hover:bg-red-800 transition-colors duration-200"
            onClick={() =>
              downloadPDF(
                users,
                selectedChallengeType === ""
                  ? [
                      "position",
                      "userName",
                      "totalPoints",
                      "practicePassed",
                      "previousRank",
                      "monthlySubmitTime",
                      "weeklySubmitTime",
                      "eligibilityAchievedAt",
                      "prize_money",
                    ]
                  : ["position", "userName", "totalPoints", "prize_money"],
                "leaderboard"
              )
            }
          >
            Download PDF
          </Button>
          {selectedChallengeType === "" && (
            <Button
              onClick={() => setShowResetModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
            >
              Admin Reset
            </Button>
          )}

          {selectedChallengeType === "" && (
            <Button
              onClick={() => setShowSortingModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              See Details
            </Button>
          )}
        </div>
      </div>

      {/* Filtering Section */}
      <div className="mb-6 flex flex-wrap items-end gap-4 p-4 bg-purple-50 rounded-lg shadow-sm border border-purple-100">
        {/* Challenge Type Dropdown */}
        <div>
          <label
            htmlFor="challengeType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Challenge Board
          </label>
          <select
            id="challengeType"
            value={selectedChallengeType}
            onChange={handleChallengeTypeChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm w-48 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Global Board (Current)</option>
            {challengeTypes.map((type) => (
              <option key={type} value={type}>
                {type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                Challenges
              </option>
            ))}
          </select>
        </div>

        {selectedChallengeType !== "" && availableChallenges.length > 0 && (
          <>
            {/* Specific Challenge Dropdown */}
            <div>
              <label
                htmlFor="specificChallenge"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Or Select Specific Challenge
              </label>
              <select
                id="specificChallenge"
                value={selectedChallengeId}
                onChange={handleSpecificChallengeChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm w-64 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={0}>-- Select a Challenge --</option>
                {availableChallenges.map((challenge) => (
                  <option
                    key={challenge.challengeId}
                    value={challenge.challengeId}
                  >
                    Challenge #{challenge.challengeId} —{" "}
                    {new Date(challenge.startDate).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}{" "}
                    to{" "}
                    {new Date(challenge.endDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter for Challenges */}
            <div className="flex flex-col">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date (Range)
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md shadow-sm w-40 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date (Range)
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md shadow-sm w-40 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <Button
              onClick={handleDateRangeFilter}
              className="bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2"
            >
              Apply Date Filter
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedChallengeId(""); // Clear specific selection when clearing date range
                if (selectedChallengeType && allChallengesData) {
                  const challengesOfType = allChallengesData[
                    selectedChallengeType as keyof AllChallengesResult
                  ] as Challenge[];
                  if (challengesOfType?.length > 0) {
                    const latestChallenge = challengesOfType.sort(
                      (a, b) =>
                        new Date(b.endDate).getTime() -
                        new Date(a.endDate).getTime()
                    )[0];
                    setSelectedChallengeId(latestChallenge.challengeId);
                    displayChallengeResults(
                      latestChallenge.results as unknown as ChallengeResult[]
                    );
                  } else {
                    setUsers([]);
                  }
                } else {
                  fetchCurrentBoard();
                }
              }}
              className="h-10 px-4 py-2 border-gray-300 hover:bg-gray-100"
            >
              Clear Date Filter
            </Button>
          </>
        )}

        {/* Monthly/Yearly Filter for Previous Global Ranks */}
        {selectedChallengeType === "" && !showFilterInputs ? (
          <Button
            onClick={() => setShowFilterInputs(true)}
            className="flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700 h-10 px-4 py-2 ml-auto"
          >
            Filter Previous Ranks <Filter className="w-4 h-4" />
          </Button>
        ) : selectedChallengeType === "" && showFilterInputs ? (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="number"
              placeholder="Month (1-12)"
              min={1}
              max={12}
              value={inputMonth}
              onChange={(e) =>
                setInputMonth(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="p-2 border border-gray-300 rounded-md w-28 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Year"
              value={inputYear}
              onChange={(e) =>
                setInputYear(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="p-2 border border-gray-300 rounded-md w-28 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <Button
              onClick={() => {
                if (
                  !inputMonth ||
                  inputMonth < 1 ||
                  inputMonth > 12 ||
                  !inputYear ||
                  inputYear < 2000
                ) {
                  alert("Please enter a valid month (1-12) and year.");
                  return;
                }
                fetchPreviousGlobalBoard(Number(inputMonth), Number(inputYear));
                setShowFilterInputs(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2"
            >
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowFilterInputs(false);
                setInputMonth("");
                setInputYear("");
                fetchCurrentBoard(); // Return to current global board
              }}
              className="h-10 px-4 py-2 border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        ) : null}
      </div>

      {/* Finalization Notice */}
      {resultFinalized &&
        selectedChallengeType === "" && ( // Only show for Global Board
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md"
            role="alert"
          >
            <p className="font-medium">Notice:</p>
            <p>
              The result has been finalized. The board will be reset and prize
              money will be distributed.
            </p>
          </div>
        )}

      {/* Table */}
      <div className="overflow-x-auto relative bg-white rounded-lg shadow-md p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-b border-gray-200">
              <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                Position
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                Participant
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                Points
              </TableHead>
              {selectedChallengeType === "" && ( // Only show these for Global Board
                <>
                  <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                    Practice Passed
                  </TableHead>
                  <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                    Prev. Rank
                  </TableHead>
                  <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                    Monthly Submit Time
                  </TableHead>
                  <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                    Weekly Submit Time
                  </TableHead>
                  <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                    Eligibility Achieved At
                  </TableHead>
                </>
              )}
              <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                Eligibility
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-semibold text-left">
                Prize
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((user, index) => {
              const globalIndex = indexOfFirstRow + index;
              const bgColor =
                globalIndex === 0
                  ? "bg-purple-600 text-white"
                  : globalIndex === 1 || globalIndex === 2
                  ? "bg-purple-500 text-white"
                  : globalIndex % 2 === 0
                  ? "bg-gray-50" // Light gray for even rows
                  : "bg-white"; // White for odd rows

              return (
                <TableRow
                  key={user.userId}
                  className={`${bgColor} border-b border-gray-100`}
                >
                  <TableCell className="py-3 px-4 font-medium">
                    {user.position}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.userImage}
                        alt={user.userName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                      />
                      <span className="font-medium">{user.userName}</span>
                      {globalIndex < 3 && (
                        <Crown
                          className="w-5 h-5 text-yellow-300 ml-1"
                          fill="currentColor"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {user.totalPoints}
                  </TableCell>
                  {selectedChallengeType === "" && ( // Only show these for Global Board
                    <>
                      <TableCell className="py-3 px-4">
                        {user.practicePassed}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {user.previousRank ?? "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs">
                        {user.monthlySubmitTime
                          ? new Date(user.monthlySubmitTime).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs">
                        {user.weeklySubmitTime
                          ? new Date(user.weeklySubmitTime).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs">
                        {user.eligibilityAchievedAt
                          ? new Date(
                              user.eligibilityAchievedAt
                            ).toLocaleString()
                          : "N/A"}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="py-3 px-4">
                    <HelpCircle
                      onMouseEnter={() => setSelectedUser(user)}
                      onMouseLeave={() => setSelectedUser(null)}
                      className="w-6 h-6 text-gray-500 bg-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-300 transition-colors"
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 font-semibold">
                    Tk. {user.prize_money}
                  </TableCell>
                </TableRow>
              );
            })}
            {currentRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={selectedChallengeType === "" ? 10 : 5}
                  className="text-center py-8 text-gray-500 text-lg"
                >
                  No data available for this selection.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="flex items-center gap-1 px-4 py-2 border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" /> Prev
        </Button>

        <span className="text-base text-gray-700 font-medium">
          Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="outline"
          className="flex items-center gap-1 px-4 py-2 border-gray-300 hover:bg-gray-100 transition-colors"
        >
          Next <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Hover Modal */}
      {selectedUser && (
        <div
          onMouseEnter={() => setSelectedUser(selectedUser)}
          onMouseLeave={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none"
        >
          <div
            className="pointer-events-auto bg-white rounded-lg shadow-2xl p-6 w-[320px] max-w-full border border-gray-100 transform scale-100 opacity-100 transition-all duration-300 ease-out"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
              Eligibility Details
            </h2>
            <ul className="text-base text-gray-700 space-y-2">
              <li>
                <span className="font-semibold text-purple-700">Monthly:</span>{" "}
                {selectedUser.monthly_eligibility} / {monthlyEligibility}
              </li>
              <li>
                <span className="font-semibold text-purple-700">Weekly:</span>{" "}
                {selectedUser.weekly_eligibility} / {weeklyEligibility}
              </li>
            </ul>
            <div className="mt-6 text-right">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 text-sm hover:bg-gray-100"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Details Modal */}
      {showSortingModal && sorting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-300">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900">
                Sorting Details
              </h2>
              <button
                onClick={() => setShowSortingModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors text-4xl font-light leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {/* Change the grid layout to a single column */}
            <div className="grid grid-cols-1 gap-8">
              {" "}
              {/* Removed multiple column configurations */}
              {Object.entries(sorting).map(([key, list]) => (
                <section
                  key={key}
                  className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3 capitalize">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace("by", "")
                      .trim()}
                  </h3>

                  <div className="flex justify-end gap-2 mb-4">
                    <Button
                      variant="secondary"
                      onClick={() => downloadCSV(list, `${key}_sorting`)}
                      className="text-sm px-3 py-1.5"
                    >
                      CSV
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        downloadPDF(
                          list,
                          getColumnsForSortingKey(key),
                          `${key}_sorting`
                        )
                      }
                      className="text-sm px-3 py-1.5"
                    >
                      PDF
                    </Button>
                  </div>

                  {list.length > 0 ? (
                    <div className="overflow-x-auto -mx-2">
                      {" "}
                      {/* Negative margin to offset padding */}
                      <Table className="w-full text-sm text-left border-collapse">
                        <TableHeader>
                          <TableRow className="bg-blue-100">
                            <TableHead className="py-2 px-3 text-blue-800 font-medium rounded-tl-md">
                              Pos
                            </TableHead>
                            <TableHead className="py-2 px-3 text-blue-800 font-medium">
                              User
                            </TableHead>
                            {key === "byTotalPoints" && (
                              <TableHead className="py-2 px-3 text-blue-800 font-medium rounded-tr-md">
                                Points
                              </TableHead>
                            )}
                            {key === "byPracticePassed" && (
                              <TableHead className="py-2 px-3 text-blue-800 font-medium rounded-tr-md">
                                Practice
                              </TableHead>
                            )}
                            {key === "byMonthlySubmitTime" && (
                              <TableHead className="py-2 px-3 text-blue-800 font-medium rounded-tr-md">
                                Monthly Submit
                              </TableHead>
                            )}
                            {key === "byWeeklySubmitTime" && (
                              <TableHead className="py-2 px-3 text-blue-800 font-medium rounded-tr-md">
                                Weekly Submit
                              </TableHead>
                            )}
                            {key === "byPreviousRank" && (
                              <TableHead className="py-2 px-3 text-blue-800 font-medium rounded-tr-md">
                                Prev. Rank
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.map((item, idx) => (
                            <TableRow
                              key={`${key}-${item.userId}-${idx}`}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                              }
                            >
                              <TableCell className="py-2 px-3">
                                {item.position}
                              </TableCell>
                              <TableCell className="py-2 px-3 flex items-center gap-2">
                                <img
                                  src={item.image}
                                  alt={`User ${item.userId}`}
                                  className="w-7 h-7 rounded-full object-cover border border-gray-200"
                                />
                                <span>{item.userName}</span>
                              </TableCell>
                              {key === "byTotalPoints" && (
                                <TableCell className="py-2 px-3">
                                  {item.totalPoints}
                                </TableCell>
                              )}
                              {key === "byPracticePassed" && (
                                <TableCell className="py-2 px-3">
                                  {item.practicePassed}
                                </TableCell>
                              )}
                              {key === "byMonthlySubmitTime" && (
                                <TableCell className="py-2 px-3 text-xs">
                                  {item.monthlySubmitTime
                                    ? new Date(
                                        item.monthlySubmitTime
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                              )}
                              {key === "byWeeklySubmitTime" && (
                                <TableCell className="py-2 px-3 text-xs">
                                  {item.weeklySubmitTime
                                    ? new Date(
                                        item.weeklySubmitTime
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                              )}
                              {key === "byPreviousRank" && (
                                <TableCell className="py-2 px-3">
                                  {item.previousRank ?? "N/A"}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No data available for this sorting criterion.
                    </p>
                  )}
                </section>
              ))}
            </div>

            <div className="mt-10 text-right border-t pt-6">
              <Button
                variant="outline"
                onClick={() => setShowSortingModal(false)}
                className="px-6 py-3 text-base border-gray-300 hover:bg-gray-100"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 transform scale-95 opacity-0 animate-scale-in-fade transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">
              Confirm Board Reset
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to finalize the results and reset the board?
              This action will distribute prizes and cannot be undone.
            </p>
            <div className="mb-6">
              <label
                htmlFor="resetMessage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Optional Message for Users:
              </label>
              <textarea
                id="resetMessage"
                className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={resetMessage}
                onChange={(e) => setResetMessage(e.target.value)}
                placeholder="e.g., Congratulations to all winners!"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 text-base border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-base"
                onClick={confirmResetBoard}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
