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

const API_URL = `${baseUrl}/api/global-board`;

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

  const rowsPerPage = 10;
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = users.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    fetchCurrentBoard();
  }, []);

  const fetchCurrentBoard = () => {
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
        }
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));
  };

  const handleResetBoard = async () => {
    if (
      !window.confirm(
        "Are you sure you want to finalize the results and reset the board?"
      )
    )
      return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result_finalization: true }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Board has been reset and prizes distributed.");
        fetchCurrentBoard();
      } else {
        alert("Reset failed.");
      }
    } catch (err) {
      console.error("Error resetting board:", err);
      alert("An error occurred while resetting the board.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <h1 className="text-black text-xl font-bold">LeaderBoard</h1>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleResetBoard}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Admin Reset
            </Button>

            <Button
              onClick={() => setShowSortingModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              See Details
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!showFilterInputs ? (
              <Button
                onClick={() => setShowFilterInputs(true)}
                className="flex items-center gap-2 bg-purple-600 text-white"
              >
                Monthly <Filter className="w-4 h-4" />
              </Button>
            ) : (
              <>
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
                  className="p-1 border rounded w-28"
                />
                <input
                  type="number"
                  placeholder="Year (e.g. 2025)"
                  value={inputYear}
                  onChange={(e) =>
                    setInputYear(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="p-1 border rounded w-28"
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
                    fetch(
                      `${baseUrl}/api/challenges/global-board-rankings?month=${inputMonth}&year=${inputYear}`
                    )
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.success && data.data?.users) {
                          setUsers(data.data.users);
                          setCurrentPage(1);
                        } else {
                          alert(
                            "No data found for the selected month and year."
                          );
                        }
                        setShowFilterInputs(false);
                        setInputMonth("");
                        setInputYear("");
                      })
                      .catch((err) => {
                        console.error("Error fetching filtered board:", err);
                        alert("Failed to fetch filtered results.");
                      });
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFilterInputs(false);
                    setInputMonth("");
                    setInputYear("");
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Finalization Notice */}
      {resultFinalized && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          The result has been finalized. The board will be reset and prize money
          will be distributed.
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Prize</TableHead>
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
                  ? "bg-gray-100"
                  : "bg-white";

              return (
                <TableRow key={user.userId} className={bgColor}>
                  <TableCell>{user.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={user.userImage}
                        alt={user.userName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user.userName}</span>
                      {globalIndex < 3 && (
                        <Crown className="w-4 h-4 text-yellow-300 ml-1" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.totalPoints}</TableCell>
                  <TableCell>
                    <HelpCircle
                      onMouseEnter={() => setSelectedUser(user)}
                      onMouseLeave={() => setSelectedUser(null)}
                      className="w-5 h-5 text-gray-500 bg-gray-200 rounded-full p-1 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>${user.prize_money}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="flex items-center gap-1"
        >
          <ChevronsLeft className="w-4 h-4" /> Prev
        </Button>

        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="outline"
          className="flex items-center gap-1"
        >
          Next <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Hover Modal */}
      {selectedUser && (
        <div
          onMouseEnter={() => selectedUser && setSelectedUser(selectedUser)}
          onMouseLeave={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
        >
          <div className="bg-white rounded shadow-lg p-6 w-[300px] max-w-full">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Eligibility Details
            </h2>
            <ul className="text-sm text-black space-y-1">
              <li>
                Monthly: {selectedUser.monthly_eligibility} /{" "}
                {monthlyEligibility}
              </li>
              <li>
                Weekly: {selectedUser.weekly_eligibility} / {weeklyEligibility}
              </li>
            </ul>
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Details Modal */}
      {showSortingModal && sorting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-5xl max-h-[85vh] overflow-y-auto transition-all">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                Sorting Details
              </h2>
              <button
                onClick={() => setShowSortingModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-8">
              {Object.entries(sorting).map(([key, list]) => (
                <section key={key}>
                  <h3 className="text-lg font-medium text-gray-700 mb-4 border-l-4 border-blue-500 pl-3 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </h3>
                  <Table className="w-full text-sm text-left">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="py-2 px-3">Position</TableHead>
                        <TableHead className="py-2 px-3">Image</TableHead>
                        <TableHead className="py-2 px-3">User</TableHead>
                        {/* Optional: Show additional columns based on key */}
                        {key === "byTotalPoints" && (
                          <TableHead>Total Points</TableHead>
                        )}
                        {key === "byPracticePassed" && (
                          <TableHead>Practice Passed</TableHead>
                        )}
                        {key === "byMonthlySubmitTime" && (
                          <TableHead>Monthly Submit Time</TableHead>
                        )}
                        {key === "byWeeklySubmitTime" && (
                          <TableHead>Weekly Submit Time</TableHead>
                        )}
                        {key === "byPreviousRank" && (
                          <TableHead>Previous Rank</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((item) => (
                        <TableRow key={`${key}-${item.userId}`}>
                          <TableCell>{item.position}</TableCell>
                          <TableCell>
                            <img
                              src={item.image}
                              alt={`User ${item.userId}`}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                          </TableCell>
                          <TableCell>{item.userName}</TableCell>

                          {/* Conditionally show extra data */}
                          {key === "byTotalPoints" && (
                            <TableCell>{item.totalPoints}</TableCell>
                          )}
                          {key === "byPracticePassed" && (
                            <TableCell>{item.practicePassed}</TableCell>
                          )}
                          {key === "byMonthlySubmitTime" && (
                            <TableCell>
                              {item.monthlySubmitTime ?? "N/A"}
                            </TableCell>
                          )}
                          {key === "byWeeklySubmitTime" && (
                            <TableCell>
                              {item.weeklySubmitTime ?? "N/A"}
                            </TableCell>
                          )}
                          {key === "byPreviousRank" && (
                            <TableCell>{item.previousRank ?? "N/A"}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              ))}
            </div>

            <div className="mt-8 text-right">
              <Button
                variant="outline"
                onClick={() => setShowSortingModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
