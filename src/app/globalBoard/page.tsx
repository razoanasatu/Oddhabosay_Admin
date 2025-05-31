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

export default function Globalboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultFinalized, setResultFinalized] = useState(false);

  const [showFilterInputs, setShowFilterInputs] = useState(false);
  const [inputMonth, setInputMonth] = useState<number | "">("");
  const [inputYear, setInputYear] = useState<number | "">("");

  const rowsPerPage = 10;

  const totalPages = Math.ceil(users.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = users.slice(indexOfFirstRow, indexOfLastRow);

  // Fetch current global board
  const fetchCurrentBoard = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.users) {
          setUsers(data.data.users);
          setResultFinalized(data.result_finalization === true);
          setCurrentPage(1);
        }
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));
  };

  useEffect(() => {
    fetchCurrentBoard();
  }, []);

  // Admin reset button handler
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

  // Pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <h1 className="text-black text-xl font-bold">GlobalBoard</h1>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Admin Reset Button */}
          <Button
            onClick={handleResetBoard}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Admin Reset
          </Button>

          {/* Monthly Filter */}
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
      <div className="overflow-auto">
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
                    <HelpCircle className="w-5 h-5 text-gray-500 bg-gray-200 rounded-full p-1" />
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
    </div>
  );
}
