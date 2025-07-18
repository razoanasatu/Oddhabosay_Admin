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
  Banknote,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  address: string;
  image: string | null;
  institution_name?: string;
  institution_type?: string;
  college_name?: string; // <-- Add this line
  university_name?: string;
  total_prize_money_received: string;
  total_withdrawal: string;
  total_spent: string;
  payment_methods: PaymentMethod[];
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

  const [showFilteredBroadcastModal, setShowFilteredBroadcastModal] =
    React.useState(false);
  const [filteredBroadcastMessage, setFilteredBroadcastMessage] =
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

  // Fetch users on component mount
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
          throw new Error("Invalid response from server or non-JSON content");
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
          setError("An unexpected error occurred while fetching users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const fieldsToSearch = [
      user.full_name,
      user.email,
      user.phone_no,
      user.address,
      user.institution_name,
      user.institution_type,
    ];
    return fieldsToSearch.some((field) => field?.toLowerCase().includes(query));
  });

  // Sort users by ID in increasing order
  const sortedUsers = [...filteredUsers].sort((a, b) => a.id - b.id);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedUsers.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  // Fetch user challenge results and stats
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

      if (!resultsRes.ok)
        throw new Error("Failed to fetch challenge results for the user.");
      if (!statsRes.ok) throw new Error("Failed to fetch user statistics.");

      const resultsData = await resultsRes.json();
      const statsData = await statsRes.json();

      setUserResults(resultsData);
      setUserStats(statsData);
    } catch (err: any) {
      setResultError(err.message || "An unexpected error occurred.");
    } finally {
      setResultLoading(false);
    }
  };

  // Send a custom notification to a specific user
  const sendNotificationToUser = async (userId: number, message: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message }),
      });

      if (!res.ok) throw new Error("Failed to send notification.");

      toast.success("Notification sent successfully!");
    } catch (error) {
      toast.error("❌ " + ((error as Error).message || "Something went wrong"));
    } finally {
      setNotificationModalOpen(false);
      setCustomMessage("");
    }
  };

  // Send a broadcast notification to all users
  const broadcastNotification = async (message: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed to broadcast notification.");

      toast.success("Broadcast notification sent successfully!");
    } catch (error) {
      toast.error((error as Error).message || "An error occurred.");
    } finally {
      setShowBroadcastModal(false);
      setCustomBroadcastMessage("");
    }
  };

  const broadcastToFilteredUsers = async (message: string) => {
    try {
      const userIds = filteredUsers.map((u) => u.id);
      if (userIds.length === 0) throw new Error("No users to notify.");
      const res = await fetch(
        `${baseUrl}/api/notifications/broadcast-multiple`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds, message }),
        }
      );
      if (!res.ok) throw new Error("Failed to broadcast notification.");
      toast.success("Notification sent to filtered users!");
    } catch (error) {
      toast.error((error as Error).message || "An error occurred.");
    } finally {
      setShowFilteredBroadcastModal(false);
      setFilteredBroadcastMessage("");
    }
  };

  // Export user data to an Excel file
  const exportUserToExcel = (user: ApiUser) => {
    const data = [
      {
        ID: user.id,
        Name: user.full_name,
        Email: user.email,
        Address: user.address,
        Phone: user.phone_no,
        "Institution Type": user.institution_type || "N/A",
        Institution: user.institution_name || "N/A",
        "Total Prize Money Received": user.total_prize_money_received,
        "Total Withdrawal": user.total_withdrawal,
        "Total Spent": user.total_spent,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Info");

    XLSX.writeFile(
      workbook,
      `User-${user.full_name.replace(/\s+/g, "_")}_${user.id}.xlsx`
    );
    toast.info(`Exported ${user.full_name}'s data to Excel.`);
  };

  // Toggle expansion of challenge types in the modal
  const toggleChallenge = (key: string) => {
    setExpandedChallenges((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Pie chart options
  const pieChartOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number) => value,
        anchor: "center" as const,
        align: "center" as const,
      },
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 12,
            family: "Inter, sans-serif", // Consistent font for charts
          },
          color: "#4A0E4B", // Dark purple for legend text
        },
      },
      tooltip: {
        backgroundColor: "rgba(74,14,75,0.9)", // Dark purple tooltip background
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 4,
      },
    },
    maintainAspectRatio: false, // Allows flexible sizing
    responsive: true, // Makes chart responsive
  };

  // Prepare data for pie charts
  const preparePieData = (dataArray: { label: string; value: number }[]) => ({
    labels: dataArray.map((d) => d.label),
    datasets: [
      {
        data: dataArray.map((d) => d.value),
        backgroundColor: [
          "#8A46B0", // Muted Purple
          "#B085F5", // Lighter Purple
          "#FFD700", // Gold/Yellow (Accent)
          "#6A5ACD", // Slate Blue (Complementary)
          "#FF6384", // Original Red (If needed for contrast)
          "#4BC0C0", // Original Teal (If needed for contrast)
        ],
        borderColor: "#ffffff", // White border for slices
        borderWidth: 2,
        hoverOffset: 8, // Slight offset on hover
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
    <div className="p-6 w-full min-h-screen bg-gray-50 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-purple-900 border-b-2 border-purple-200 pb-4">
        Users Dashboard
      </h1>

      {searchQuery && (
        <div className="flex justify-center w-full mb-6">
          <span className="text-xl font-semibold text-purple-800 animate-fade-in tracking-wide py-2 px-4 bg-purple-100 rounded-lg shadow-sm">
            Total users found: {filteredUsers.length}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm w-full sm:w-96 focus-within:border-purple-600 focus-within:ring-1 focus-within:ring-purple-400 transition-all duration-200">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <Input
            placeholder="Search users by name, email, phone, or institution..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-grow border-0 focus:ring-0 focus-visible:ring-0 text-gray-800 placeholder-gray-400 text-base"
          />
        </div>

        <div className="flex gap-3 items-center mx-auto sm:mx-0 mt-4 sm:mt-0">
          <Select
            onValueChange={handleRowsPerPageChange}
            defaultValue={rowsPerPage.toString()}
          >
            <SelectTrigger className="w-32 border border-purple-500 rounded-md shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all text-purple-800">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent className="border border-purple-300 rounded-md shadow-lg bg-white z-50">
              {[5, 10, 20, 50].map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="hover:bg-purple-100 focus:bg-purple-100 text-purple-800 cursor-pointer"
                >
                  Show {num} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-purple-700 text-white hover:bg-purple-800 px-5 py-2 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Bell className="w-5 h-5" /> Broadcast Message
          </Button>

          <Button
            onClick={() => setShowFilteredBroadcastModal(true)}
            className="bg-purple-600 text-white hover:bg-purple-700 px-5 py-2 rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Bell className="w-5 h-5" /> Broadcast to Filtered Users
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <Table className="min-w-[1400px] text-gray-800">
          <TableHeader className="bg-purple-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-12 text-purple-900 font-bold text-sm uppercase tracking-wider"></TableHead>
              <TableHead className="text-purple-900 font-bold text-sm uppercase tracking-wider">
                ID
              </TableHead>
              <TableHead className="text-purple-900 font-bold text-sm uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="text-purple-900 font-bold text-sm uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="text-purple-900 font-bold text-sm uppercase tracking-wider">
                Address
              </TableHead>
              <TableHead className="text-purple-900 font-bold text-sm uppercase tracking-wider">
                Phone
              </TableHead>
              <TableHead className="text-purple-900 font-bold text-sm uppercase tracking-wider">
                Payment
              </TableHead>
              <TableHead className="text-purple-900 text-center font-bold text-sm uppercase tracking-wider">
                College Name
              </TableHead>
              <TableHead className="text-purple-900 text-center font-bold text-sm uppercase tracking-wider">
                University Name
              </TableHead>
              <TableHead className="text-purple-900 text-center  font-bold text-sm uppercase tracking-wider text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-gray-500 text-lg"
                >
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-6 w-6 mr-3 text-purple-600"
                      viewBox="0 0 24 24"
                    >
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
                    Loading user data...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-red-600 text-lg"
                >
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : currentRows.length > 0 ? (
              currentRows.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-purple-50 transition-colors duration-150"
                >
                  <TableCell></TableCell>
                  <TableCell className=" font-medium text-gray-900 min-w-[100px]">
                    {user.id}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.full_name
                          )}&background=8A46B0&color=ffffff&size=40`
                        }
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                      />
                      <span className="font-semibold min-w-[250px] text-gray-900">
                        {user.full_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px] text-gray-700">
                    {user.email}
                  </TableCell>
                  <TableCell className="min-w-[300px] text-gray-700">
                    {user.address}
                  </TableCell>
                  <TableCell className="min-w-[150px] text-gray-700">
                    {user.phone_no}
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    {user.payment_methods && user.payment_methods.length > 0 ? (
                      <Link href={`/paymentDetails/${user.id}`} passHref>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md border border-purple-500 text-purple-600 hover:bg-purple-100 px-3 py-1.5 transition-colors duration-150"
                          title="View Payment Details"
                        >
                          <Banknote className="w-5 h-5 mr-1" /> View
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">
                        Not Available
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[150px] text-gray-700 text-center ">
                    {user.college_name || "-"}
                  </TableCell>
                  <TableCell className="min-w-[200px] text-gray-700 text-center">
                    {user.university_name || "-"}
                  </TableCell>
                  <TableCell className="text-center min-w-[170px]">
                    {" "}
                    {/* Increased min-width for horizontal buttons */}
                    <div className="flex flex-row gap-2 items-center justify-center mb-2">
                      {" "}
                      {/* Changed to flex-row */}
                      <Button
                        aria-label="View user details"
                        variant="outline"
                        size="sm"
                        className="rounded-md border border-blue-500 text-blue-600 hover:bg-blue-100 px-3 py-1.5 transition-colors duration-150"
                        title="View Challenge History & Stats"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          fetchUserResults(user.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md border border-orange-500 text-orange-600 hover:bg-orange-100 px-3 py-1.5 transition-colors duration-150"
                        title="Send Custom Notification"
                        onClick={() => {
                          setCurrentUserId(user.id);
                          setNotificationModalOpen(true);
                        }}
                      >
                        <Bell className="w-4 h-4 mr-1" /> Notify
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-md border border-green-500 text-green-600 hover:bg-green-100 w-full px-3 py-1.5 transition-colors duration-150"
                      title="Export User Data to Excel"
                      onClick={() => exportUserToExcel(user)}
                    >
                      📄 Export
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-gray-500 text-lg italic"
                >
                  No users found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-8 flex-wrap gap-4 px-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="flex items-center gap-1 text-purple-700 border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" /> Previous
        </Button>

        <span className="text-base text-gray-700 font-medium">
          Page <span className="font-bold text-purple-800">{currentPage}</span>{" "}
          of{" "}
          <span className="font-bold text-purple-800">
            {totalPages === 0 ? 1 : totalPages}
          </span>
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="outline"
          className="flex items-center gap-1 text-purple-700 border-purple-300 hover:bg-purple-50 transition-colors"
        >
          Next <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Notification Modal */}
      {notificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-scale-in">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors text-xl font-bold"
              onClick={() => setNotificationModalOpen(false)}
              aria-label="Close notification modal"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-purple-900 mb-5 border-b pb-3">
              Send Notification to User
            </h2>

            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              placeholder="Type your custom message here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-y text-base"
              aria-label="Custom notification message"
            />

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setNotificationModalOpen(false)}
                className="px-5 py-2 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-700 text-white hover:bg-purple-800 px-6 py-2 rounded-lg shadow-md transition-all"
                onClick={() => {
                  if (currentUserId !== null && customMessage.trim()) {
                    sendNotificationToUser(currentUserId, customMessage);
                  } else {
                    toast.error("Please enter a message before sending.");
                  }
                }}
              >
                Send Notification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-scale-in">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors text-xl font-bold"
              onClick={() => setShowBroadcastModal(false)}
              aria-label="Close broadcast modal"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-purple-900 mb-5 border-b pb-3">
              Broadcast Message to All Users
            </h2>
            <textarea
              value={customBroadcastMessage}
              onChange={(e) => setCustomBroadcastMessage(e.target.value)}
              rows={5}
              placeholder="Type your broadcast message here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-y text-base"
              aria-label="Custom broadcast message"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBroadcastModal(false)}
                className="px-5 py-2 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-700 text-white hover:bg-purple-800 px-6 py-2 rounded-lg shadow-md transition-all"
                onClick={() => {
                  if (customBroadcastMessage.trim()) {
                    broadcastNotification(customBroadcastMessage);
                  } else {
                    toast.error("Please enter a message to broadcast.");
                  }
                }}
              >
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast to Filtered Users Modal */}
      {showFilteredBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-scale-in">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors text-xl font-bold"
              onClick={() => setShowFilteredBroadcastModal(false)}
              aria-label="Close filtered broadcast modal"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-purple-900 mb-5 border-b pb-3">
              Broadcast to Filtered Users
            </h2>
            <textarea
              value={filteredBroadcastMessage}
              onChange={(e) => setFilteredBroadcastMessage(e.target.value)}
              rows={5}
              placeholder="Type your message for filtered users..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-y text-base"
              aria-label="Filtered broadcast message"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilteredBroadcastModal(false)}
                className="px-5 py-2 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-lg shadow-md transition-all"
                onClick={() => {
                  if (filteredBroadcastMessage.trim()) {
                    broadcastToFilteredUsers(filteredBroadcastMessage);
                  } else {
                    toast.error("Please enter a message to broadcast.");
                  }
                }}
              >
                Send to Filtered Users
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Results Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-6xl p-8 rounded-xl shadow-2xl overflow-y-auto max-h-[95vh] relative animate-scale-in">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-xl font-bold"
              onClick={() => setModalOpen(false)}
              aria-label="Close user details modal"
            >
              ✕
            </button>

            <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-900 border-b-2 pb-4">
              {users.find((u) => u.id === selectedUserId)?.full_name || "User"}{" "}
              Challenge Details & Statistics
            </h2>

            {resultLoading ? (
              <p className="text-center py-10 text-gray-600 text-lg">
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-7 w-7 mr-3 text-purple-600"
                    viewBox="0 0 24 24"
                  >
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
                  Loading challenge details and user stats...
                </div>
              </p>
            ) : resultError ? (
              <p className="text-center py-10 text-red-600 text-lg">
                Error: {resultError}
              </p>
            ) : (
              <>
                {userStats && (
                  <div className="mt-8 mb-10 p-6 bg-purple-50 rounded-lg shadow-inner border border-purple-100">
                    <h3 className="text-2xl font-bold mb-6 text-purple-900 text-center">
                      Overall User Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center border border-gray-100">
                        <h4 className="text-xl font-semibold mb-4 text-purple-800 border-b pb-2 w-full text-center">
                          Practice Challenge Stats
                        </h4>
                        <div className="w-72 h-72 flex items-center justify-center">
                          <Pie
                            data={practiceStatsData}
                            options={pieChartOptions}
                          />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center border border-gray-100">
                        <h4 className="text-xl font-semibold mb-4 text-purple-800 border-b pb-2 w-full text-center">
                          Exam Challenge Stats
                        </h4>
                        <div className="w-72 h-72 flex items-center justify-center">
                          <Pie data={examStatsData} options={pieChartOptions} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userResults && (
                  <div className="space-y-8 mb-6">
                    <h3 className="text-2xl font-bold text-purple-900 text-center pt-4 border-t-2 border-purple-200 mt-8">
                      Detailed Challenge History
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
                        className="border border-purple-200 rounded-lg shadow-sm bg-white overflow-hidden"
                      >
                        <button
                          onClick={() => toggleChallenge(key)}
                          className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-t-lg transition-colors duration-200"
                          aria-expanded={expandedChallenges[key]}
                          aria-controls={`${key}-content`}
                          id={`${key}-header`}
                        >
                          <span className="capitalize">
                            {key.replace("_", " ")} Challenges
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({userResults[key]?.length || 0} Users)
                            </span>
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
                              ? "max-h-[500px] p-4"
                              : "max-h-0 px-6"
                          }`}
                        >
                          {userResults[key]?.length > 0 ? (
                            <div className="overflow-x-auto max-h-80 custom-scrollbar pr-2">
                              <Table className="min-w-full divide-y divide-gray-200">
                                <TableHeader className="bg-gray-50">
                                  <TableRow>
                                    <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </TableHead>
                                    <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Score
                                    </TableHead>
                                    <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Correct
                                    </TableHead>
                                    <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Position
                                    </TableHead>
                                    <TableHead className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Prize
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                  {userResults[key].map((item: any) => (
                                    <TableRow
                                      key={item.challenge_id}
                                      className="hover:bg-gray-50"
                                    >
                                      <TableCell className="py-2 whitespace-nowrap text-sm text-gray-800">
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell className="py-2 whitespace-nowrap text-sm text-gray-800">
                                        {item.score}
                                      </TableCell>
                                      <TableCell className="py-2 whitespace-nowrap text-sm text-gray-800">
                                        {item.correct_answers}
                                      </TableCell>
                                      <TableCell className="py-2 whitespace-nowrap text-sm text-gray-800">
                                        {item.position || "-"}
                                      </TableCell>
                                      <TableCell className="py-2 whitespace-nowrap text-sm text-gray-800">
                                        {item.prize_money}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-base text-gray-500 italic px-4 py-3 bg-gray-50 rounded-b-lg">
                              No {key.replace("_", " ")} challenge data
                              available for this user.
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
