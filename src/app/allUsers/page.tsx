"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { baseUrl } from "@/utils/constant";
import { Bell, ChevronsLeft, ChevronsRight, Eye, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  address: string;
  image: string | null;
  institution_name?: string; // Add this line
}

export default function Dashboard() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userResults, setUserResults] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/users`, {
          headers: {
            Accept: "application/json",
          },
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error("Invalid response from server");
        }

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setUsers(json.data);
        } else {
          throw new Error(json.message || "Failed to load users");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    [user.full_name, user.email, user.phone_no, user.address]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) =>
    a.id.toString().localeCompare(b.id.toString())
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedUsers.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const fetchUserResults = async (userId: number) => {
    setResultLoading(true);
    setResultError(null);
    setUserResults(null);
    setUserStats(null);
    setModalOpen(true);

    try {
      const [resultsRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/api/users/${userId}/challenge-summary`, {
          headers: { Accept: "application/json" },
        }),
        fetch(`${baseUrl}/api/challenges/user-stats?userId=${userId}`, {
          headers: { Accept: "application/json" },
        }),
      ]);

      if (!resultsRes.ok) throw new Error("Failed to fetch challenge results");
      if (!statsRes.ok) throw new Error("Failed to fetch user stats");

      const resultsData = await resultsRes.json();
      const statsData = await statsRes.json();

      setUserResults(resultsData);
      setUserStats(statsData);
    } catch (err: any) {
      setResultError(err.message || "Unexpected error");
    } finally {
      setResultLoading(false);
    }
  };

  const sendNotificationToUser = async (userId: number) => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // User ID dynamically passed
          message: "This is a test from Anik.", // Specific message payload
        }),
      });

      if (!res.ok) throw new Error("Failed to send notification");

      alert("Notification sent to user.");
    } catch (error) {
      alert((error as Error).message || "An error occurred.");
    }
  };

  const broadcastNotification = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "📢 System push notification test for all user!", // Broadcast message payload
        }),
      });

      if (!res.ok) throw new Error("Failed to broadcast notification");

      alert("Broadcast notification sent.");
    } catch (error) {
      alert((error as Error).message || "An error occurred.");
    }
  };

  const exportUserToExcel = (user: ApiUser) => {
    const data = [
      {
        ID: user.id,
        Name: user.full_name,
        Email: user.email,
        Address: user.address,
        Phone: user.phone_no,
        Institution: user.institution_name || "N/A", // ✅ Added
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Info");

    XLSX.writeFile(
      workbook,
      `User-${user.full_name.replace(/\s+/g, "_")}.xlsx`
    );
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-black">User Dashboard</h1>

      {/* Search, Rows & Broadcast */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center border rounded px-2 bg-white w-full sm:w-96">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            placeholder="Search user"
            value={searchQuery}
            onChange={handleSearch}
            className="flex-grow border-0 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Select
            onValueChange={handleRowsPerPageChange}
            defaultValue={rowsPerPage.toString()}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={broadcastNotification}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            📢 Broadcast
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <div style={{ minWidth: "900px" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  {/*<input type="checkbox" className="rounded" />*/}
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : currentRows.length > 0 ? (
                currentRows.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {/*<input type="checkbox" className="rounded" />*/}
                    </TableCell>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            user.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.full_name
                            )}&background=random`
                          }
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{user.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>{user.phone_no}</TableCell>
                    <TableCell>{user.institution_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-md border border-purple-500 text-purple-500 hover:bg-purple-100"
                            title="View"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              fetchUserResults(user.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-md border border-purple-500 text-purple-500 hover:bg-purple-100"
                            title="Send Notification"
                            onClick={() => sendNotificationToUser(user.id)}
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-md border border-green-500 text-green-600 hover:bg-green-100"
                          title="Export to Excel"
                          onClick={() => exportUserToExcel(user)}
                        >
                          📄 Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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

      {/* Challenge Results Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-7xl p-6 rounded-lg overflow-y-auto max-h-[100vh] relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-center">
              User Challenge Details
            </h2>

            {resultLoading ? (
              <p className="text-center">Loading challenge details...</p>
            ) : resultError ? (
              <p className="text-center text-red-500">{resultError}</p>
            ) : (
              <>
                {userResults && (
                  <div className="space-y-4">
                    {[
                      "weekly",
                      "monthly",
                      "mega",
                      "special_event",
                      "practice",
                    ].map((key) => (
                      <div key={key}>
                        <h3 className="text-lg font-bold capitalize mb-2">
                          {key.replace("_", " ")} Challenges
                        </h3>
                        {userResults[key]?.length > 0 ? (
                          <div className="overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Challenge ID</TableHead>
                                  <TableHead>Score</TableHead>
                                  <TableHead>Correct</TableHead>
                                  <TableHead>Position</TableHead>
                                  <TableHead>Prize</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {userResults[key].map((item: any) => (
                                  <TableRow key={item.challenge_id}>
                                    <TableCell>{item.challenge_id}</TableCell>
                                    <TableCell>{item.score}</TableCell>
                                    <TableCell>
                                      {item.correct_answers}
                                    </TableCell>
                                    <TableCell>
                                      {item.position || "-"}
                                    </TableCell>
                                    <TableCell>{item.prize_money}</TableCell>
                                    <TableCell>
                                      {new Date(
                                        item.createdAt
                                      ).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No {key} challenge data available.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {userStats && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">User Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                      <div>
                        <h4 className="font-semibold mb-1">Practice Stats</h4>
                        <ul className="list-disc list-inside">
                          <li>Weekly: {userStats.practice_stats.weekly}</li>
                          <li>Monthly: {userStats.practice_stats.monthly}</li>
                          <li>Yearly: {userStats.practice_stats.yearly}</li>
                          <li>
                            Last 3 Months:{" "}
                            {userStats.practice_stats.last_3_months}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Exam Stats</h4>
                        <ul className="list-disc list-inside">
                          <li>
                            Weekly: {userStats.exam_stats.weekly_exam_stats}
                          </li>
                          <li>
                            Monthly: {userStats.exam_stats.monthly_exam_stats}
                          </li>
                          <li>Mega: {userStats.exam_stats.mega_exam_stats}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
