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
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  address: string;
  image: string | null;
  institution_name?: string; // Add this line
  total_prize_money_received: string; // Add these
  total_withdrawal: string; // Add these
  total_spent: string; // Add these
  payment_methods: PaymentMethod[]; // Add this
}
interface PaymentMethod {
  id: number;
  method_type: string;
  card_name: string | null;
  card_number: string | null;
  exp_month: string | null;
  exp_year: string | null;
  cvc: string | null;
  branchName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  routingNumber: string | null;
  swiftCode: string | null;
  accountOwnerPhoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [customBroadcastMessage, setCustomBroadcastMessage] =
    React.useState("");

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userResults, setUserResults] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [expandedChallenges, setExpandedChallenges] = useState<
    Record<string, boolean>
  >({});

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

  const sendNotificationToUser = async (userId: number, message: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, // User ID dynamically passed
          message, // Specific message payload
        }),
      });

      if (!res.ok) throw new Error("Failed to send notification");

      toast.success(" Notification sent to user");
    } catch (error) {
      toast.error("❌ " + ((error as Error).message || "Something went wrong"));
    }
  };

  const broadcastNotification = async (message: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
        }),
      });

      if (!res.ok) throw new Error("Failed to broadcast notification");

      toast.success("Broadcast notification sent.");
      setShowBroadcastModal(false);
      setCustomBroadcastMessage("");
    } catch (error) {
      toast.error((error as Error).message || "An error occurred.");
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
  const toggleChallenge = (key: string) => {
    setExpandedChallenges((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const pieChartOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number) => value, // 👈 show raw number
        anchor: "center" as const,
        align: "center" as const,
      },
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const preparePieData = (dataArray: { label: string; value: number }[]) => ({
    labels: dataArray.map((d) => d.label),
    datasets: [
      {
        data: dataArray.map((d) => d.value),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderWidth: 1,
      },
    ],
  });

  const practiceStatsData =
    userStats &&
    preparePieData([
      { label: "Weekly", value: userStats.practice_stats.weekly },
      { label: "Monthly", value: userStats.practice_stats.monthly },
      { label: "Yearly", value: userStats.practice_stats.yearly },
      { label: "Last 3 Months", value: userStats.practice_stats.last_3_months },
    ]);

  const examStatsData =
    userStats &&
    preparePieData([
      { label: "Weekly", value: userStats.exam_stats.weekly_exam_stats },
      { label: "Monthly", value: userStats.exam_stats.monthly_exam_stats },
      { label: "Mega", value: userStats.exam_stats.mega_exam_stats },
    ]);

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-purple-900">
        User Dashboard
      </h1>

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
            onClick={() => setShowBroadcastModal(true)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            📢 Broadcast
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className=" w-full text-purple-900">
        <div className="min-w-[1200px]">
          {" "}
          {/* Adjust width as needed */}
          <Table className="border border-gray-200">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-12 ">
                  {/*<input type="checkbox" className="rounded" />*/}
                </TableHead>
                <TableHead className="text-purple-900">ID</TableHead>
                <TableHead className="text-purple-900">Name</TableHead>
                <TableHead className="text-purple-900">Email</TableHead>
                <TableHead className="text-purple-900">Address</TableHead>
                <TableHead className="text-purple-900">Phone</TableHead>
                <TableHead className="text-purple-900">
                  Payment Details
                </TableHead>
                <TableHead className="text-purple-900">Institution</TableHead>
                <TableHead className="text-purple-900">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition">
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
                    <TableCell className="min-w-[300px]">
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
                    <TableCell className="min-w-[200px]">
                      {user.email}
                    </TableCell>
                    <TableCell className="min-w-[450px]">
                      {user.address}
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      {user.phone_no}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {/* Add this whole TableCell */}
                      <Link href={`/paymentDetails/${user.id}`} passHref>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-md border border-blue-500 text-blue-500 hover:bg-blue-100"
                          title="View Payment Details"
                        >
                          <DollarSign className="w-4 h-4" />{" "}
                          {/* You'll need to import DollarSign */}
                        </Button>
                      </Link>
                    </TableCell>

                    <TableCell className="min-w-[200px]">
                      {user.institution_name || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <Button
                            aria-label="View user details"
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
                            onClick={() => {
                              setCurrentUserId(user.id);
                              setNotificationModalOpen(true);
                            }}
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

      {notificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setNotificationModalOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-purple-900 mb-4">
              Send Notification
            </h2>

            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              placeholder="Type your custom message..."
              className="w-full p-3 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNotificationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  if (currentUserId && customMessage.trim()) {
                    sendNotificationToUser(currentUserId, customMessage);
                    setNotificationModalOpen(false);
                    setCustomMessage("");
                  } else {
                    alert("Please enter a message.");
                  }
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowBroadcastModal(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-purple-900 mb-4">
              Enter Broadcast Message
            </h2>
            <textarea
              value={customBroadcastMessage}
              onChange={(e) => setCustomBroadcastMessage(e.target.value)}
              rows={4}
              placeholder="Type your custom broadcast message..."
              className="w-full p-3 border rounded-md focus:outline-none focus:ring focus:ring-purple-400"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBroadcastModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  if (customBroadcastMessage.trim()) {
                    broadcastNotification(customBroadcastMessage);
                    setShowBroadcastModal(false);
                    setCustomBroadcastMessage("");
                  } else {
                    alert("Please enter a message.");
                  }
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

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

            <h2 className="text-2xl font-semibold mb-4 text-center text-purple-900">
              User Challenge Details
            </h2>

            {resultLoading ? (
              <p className="text-center">Loading challenge details...</p>
            ) : resultError ? (
              <p className="text-center text-red-500">{resultError}</p>
            ) : (
              <>
                {userStats && (
                  <div className="mt-8 mb-8">
                    <h3 className="text-lg font-bold mb-4 text-purple-900">
                      User Stats
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
                        <h4 className="text-center font-semibold mb-2 text-purple-900">
                          Practice Stats
                        </h4>
                        <div className="w-64">
                          <Pie
                            data={practiceStatsData}
                            options={pieChartOptions}
                          />
                        </div>
                      </div>
                      <div className="bg-white rounded shadow p-4 flex flex-col items-center">
                        <h4 className="text-center font-semibold mb-2 text-purple-900 ">
                          Exam Stats
                        </h4>
                        <div className="w-64">
                          <Pie data={examStatsData} options={pieChartOptions} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userResults && (
                  <div className="space-y-6 mb-10">
                    <h3 className="text-2xl font-bold text-purple-900">
                      Challenge History
                    </h3>

                    {[
                      "weekly",
                      "monthly",
                      "mega",

                      "practice",
                      "special_event",
                    ].map((key) => (
                      <div
                        key={key}
                        className="border border--200 rounded-lg shadow-sm bg-white"
                      >
                        <button
                          onClick={() => toggleChallenge(key)}
                          className="w-full flex justify-between items-center px-5 py-4 text-lg font-semibold text-purple-800 bg-white-500 hover:bg-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-t-lg transition"
                          aria-expanded={
                            expandedChallenges[key] ? "true" : "false"
                          }
                          aria-controls={`${key}-content`}
                          id={`${key}-header`}
                        >
                          <span className="capitalize">
                            {key.replace("_", " ")} Challenges
                          </span>
                          <svg
                            className={`w-5 h-5 text-purple-600 transform transition-transform duration-300 ${
                              expandedChallenges[key]
                                ? "rotate-180"
                                : "rotate-0"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        <div
                          id={`${key}-content`}
                          role="region"
                          aria-labelledby={`${key}-header`}
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedChallenges[key]
                              ? "max-h-[600px] p-4"
                              : "max-h-0 px-5"
                          }`}
                        >
                          {userResults[key]?.length > 0 ? (
                            <div className="max-h-80 scrollbar-thin scrollbar-thumb-gray-300">
                              <Table className="overflow-x-auto">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    {/* <TableHead>Challenge ID</TableHead> */}
                                    <TableHead>Score</TableHead>
                                    <TableHead>Correct</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Prize</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {userResults[key].map((item: any) => (
                                    <TableRow key={item.challenge_id}>
                                      {/* <TableCell>{item.challenge_id}</TableCell> */}
                                      <TableCell>
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>{item.score}</TableCell>
                                      <TableCell>
                                        {item.correct_answers}
                                      </TableCell>
                                      <TableCell>
                                        {item.position || "-"}
                                      </TableCell>
                                      <TableCell>{item.prize_money}</TableCell>
                                      {/* <TableCell>
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleDateString()}
                                      </TableCell> */}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic px-4 py-2">
                              No {key.replace("_", " ")} challenge data
                              available.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
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
