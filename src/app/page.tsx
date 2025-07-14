"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react"; // Added useMemo
import { Bar, Line, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// --- Interface Definitions (No changes needed here, they look good) ---
interface User {
  id: number;
  type: string;
  full_name: string;
  email: string;
  phone_no: string;
  account_number: string;
  accepted_terms: boolean;
  accepted_terms_time: string | null;
  city: string;
  country: string;
  state: string | null;
  zip_code: string;
  latitude: number;
  longitude: number;
  institution_name: string | null;
  birth_date: string | null;
  address: string;
  total_prize_money_received: string;
  total_withdrawal: string;
  total_spent: string;
  deviceToken: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Challenge {
  id: number;
  challenge_type: string;
  fee: number;
  deadline: string;
  quiz_time: number;
  active_status: boolean;
  event_code: string;
  registered_users: number;
  result_finalization: boolean;
  start_datetime: string;
  end_datetime: string;
  total_marks: number;
  total_seats: number;
  available_seats: number;
  createdAt: string;
  updatedAt: string;
  users: any[];
  prizeDetails: any[];
  rules: any;
  requirements: any;
  specialEventDetails: any;
}

interface ChallengesData {
  weekly: Challenge[];
  monthly: Challenge[];
  mega: Challenge[];
  special_events: Challenge[];
}

// --- Dashboard Component ---
export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState<number | string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true); // New loading state for challenges
  const [challengesData, setChallengesData] = useState<ChallengesData>({
    weekly: [],
    monthly: [],
    mega: [],
    special_events: [],
  });
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [cardsData, setCardsData] = useState([
    {
      title: "Total Users",
      number: null as number | string | null,
      description:
        "Active users registered on the platform this month across all regions.",
    },
    // You can add more cards here if your dashboard expands, e.g.:
    // { title: "Total Challenges", number: null, description: "All challenges created to date." },
    // { title: "Total Revenue", number: null, description: "Total earnings from challenge fees." },
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(
          "https://api.backend.oddhabosay.code-studio4.com/api/users"
        );
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          const userCount = data.data.length;
          setTotalUsers(userCount);
          setAllUsers(data.data);

          setCardsData((prevCardsData) =>
            prevCardsData.map((card) =>
              card.title === "Total Users"
                ? { ...card, number: userCount.toString() }
                : card
            )
          );
        } else {
          console.error(
            "Failed to fetch users or data format is incorrect:",
            data
          );
          setTotalUsers("N/A");
          setAllUsers([]);
          setCardsData((prevCardsData) =>
            prevCardsData.map((card) =>
              card.title === "Total Users" ? { ...card, number: "N/A" } : card
            )
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setTotalUsers("N/A");
        setAllUsers([]);
        setCardsData((prevCardsData) =>
          prevCardsData.map((card) =>
            card.title === "Total Users" ? { ...card, number: "N/A" } : card
          )
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchChallenges = async () => {
      setLoadingChallenges(true); // Set loading true
      try {
        const response = await fetch(
          "https://api.backend.oddhabosay.code-studio4.com/api/challenges/all-challenges"
        );
        const data = await response.json();

        if (response.ok && data) {
          // Assuming data structure is directly the ChallengesData
          setChallengesData(data);

          // Extract available years from the data
          const years = new Set<number>();
          const allChallengesArray = [
            ...(data.weekly || []), // Use || [] to ensure it's iterable even if a category is missing
            ...(data.monthly || []),
            ...(data.mega || []),
            ...(data.special_events || []),
          ];

          if (allChallengesArray.length > 0) {
            allChallengesArray.forEach((challenge: Challenge) => {
              const year = new Date(challenge.createdAt).getFullYear();
              years.add(year);
            });
            const sortedYears = Array.from(years).sort((a, b) => b - a);
            setAvailableYears(sortedYears);
            // Set selectedYear to the most recent available year if it's not already set to a valid one
            if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
              setSelectedYear(sortedYears[0]);
            }
          } else {
            // If no challenges, default to current year
            const currentYear = new Date().getFullYear();
            setAvailableYears([currentYear]);
            setSelectedYear(currentYear);
          }
        } else {
          console.error(
            "Failed to fetch challenges or data format is incorrect:",
            data
          );
          setChallengesData({
            weekly: [],
            monthly: [],
            mega: [],
            special_events: [],
          });
          const currentYear = new Date().getFullYear();
          setAvailableYears([currentYear]);
          setSelectedYear(currentYear);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
        setChallengesData({
          weekly: [],
          monthly: [],
          mega: [],
          special_events: [],
        });
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear]);
        setSelectedYear(currentYear);
      } finally {
        setLoadingChallenges(false); // Set loading false
      }
    };

    fetchUsers();
    fetchChallenges();
  }, [selectedYear]); // Re-fetch challenges if selectedYear changes? Or only update availableYears? Let's keep it minimal.
  // Re-run useEffect only on initial mount. Year changes will filter existing data.

  // Helper to filter challenges by selected year
  const filterChallengesByYear = (challenges: Challenge[]) => {
    return (challenges || []).filter((challenge) => {
      // Ensure challenges is an array
      const year = new Date(challenge.createdAt).getFullYear();
      return year === selectedYear;
    });
  };

  // --- Chart Data Preparation Functions (Memoized for performance) ---

  const prepareBarChartData = useMemo(
    () => (challenges: Challenge[]) => {
      const filteredChallenges = filterChallengesByYear(challenges);
      if (filteredChallenges.length === 0) {
        return { labels: [], datasets: [] }; // Return empty data if no challenges
      }
      const labels = filteredChallenges.map(
        (challenge) => `${challenge.challenge_type} (ID: ${challenge.id})`
      );
      const data = filteredChallenges.map(
        (challenge) => challenge.registered_users
      );

      return {
        labels,
        datasets: [
          {
            label: "Registered Users",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
    },
    [selectedYear]
  ); // Recompute when selectedYear changes

  const preparePieChartData = useMemo(
    () => (challenges: Challenge[]) => {
      const filteredChallenges = filterChallengesByYear(challenges);
      if (filteredChallenges.length === 0) {
        return { labels: [], datasets: [] };
      }
      const labels = filteredChallenges.map(
        (challenge) => `${challenge.challenge_type} (ID: ${challenge.id})`
      );
      const data = filteredChallenges.map(
        (challenge) => challenge.available_seats
      );

      return {
        labels,
        datasets: [
          {
            label: "Available Seats",
            data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)", // Added more colors for more slices
              "rgba(255, 159, 64, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };
    },
    [selectedYear]
  );

  const prepareLineChartData = useMemo(
    () => (challenges: Challenge[]) => {
      const filteredChallenges = filterChallengesByYear(challenges);
      if (filteredChallenges.length === 0) {
        return { labels: [], datasets: [] };
      }
      const labels = filteredChallenges.map(
        (challenge) => `${challenge.challenge_type} (ID: ${challenge.id})`
      );
      const data = filteredChallenges.map((challenge) => challenge.total_marks);

      return {
        labels,
        datasets: [
          {
            label: "Total Marks",
            data,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
            tension: 0.1, // Add tension for a smoother line
          },
        ],
      };
    },
    [selectedYear]
  );

  // Chart Options (can be customized)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to take up full available space
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false, // Titles are handled by h2 tags
      },
      tooltip: {
        // Basic tooltip customization
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
    scales: {
      // Example: for bar/line charts to ensure starting from 0
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Total Users") {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-purple-900 rounded-sm text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        {/* Year Selector */}
        <div className="mb-4 flex items-center">
          <label
            htmlFor="year-select"
            className="mr-2 text-gray-700 font-semibold"
          >
            Select Year:
          </label>
          {loadingChallenges ? (
            <p className="text-gray-500">Loading years...</p>
          ) : (
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option value={new Date().getFullYear()}>
                  {new Date().getFullYear()} (No data)
                </option>
              )}
            </select>
          )}
        </div>
        <hr className="my-6 border-t border-gray-300" /> {/* Separator */}
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cardsData.map((card, index) => {
            const isEven = (index + 1) % 2 === 0;

            return (
              <div
                key={index}
                className={`relative bg-white border border-purple-200 rounded-xl shadow-md p-6 h-44 overflow-hidden ${
                  card.title === "Total Users"
                    ? "cursor-pointer hover:border-purple-500 transition-all duration-200"
                    : ""
                }`}
                onClick={() => handleCardClick(card.title)}
              >
                {/* Background circles for visual flair */}
                {isEven ? (
                  <div className="absolute bottom-2 left-2 flex z-0">
                    <div className="w-24 h-24 rounded-full bg-blue-300 opacity-30 -ml-8 -mb-8"></div>
                    <div className="w-24 h-24 rounded-full bg-pink-300 opacity-30 -ml-10 -mb-10"></div>
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 flex z-0">
                    <div className="w-24 h-24 rounded-full bg-pink-300 opacity-30 -mr-8 -mt-8"></div>
                    <div className="w-24 h-24 rounded-full bg-blue-300 opacity-30 -mr-10 -mt-10"></div>
                  </div>
                )}

                <div className="relative z-10">
                  <h2 className="text-xl font-semibold text-black">
                    {card.title}
                  </h2>
                  {card.number !== null ? (
                    <p className="text-3xl font-bold text-black mt-2">
                      {card.number}
                    </p>
                  ) : (
                    card.title === "Total Users" && (
                      <p className="text-xl font-semibold text-gray-400 mt-2">
                        Loading...
                      </p>
                    )
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <hr className="my-6 border-t border-gray-300" />
        {/* Bar Charts for Registered Users */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Challenge Participation Overviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            {
              title: "Weekly Challenges - Registered Users",
              data: challengesData.weekly,
            },
            {
              title: "Monthly Challenges - Registered Users",
              data: challengesData.monthly,
            },
            {
              title: "Mega Challenges - Registered Users",
              data: challengesData.mega,
            },
            {
              title: "Special Events - Registered Users",
              data: challengesData.special_events,
            },
          ].map((chart, idx) => (
            <div
              key={idx}
              className="bg-white border border-purple-200 rounded-xl shadow-md p-4"
            >
              <h3 className="text-xl font-semibold text-black mb-4">
                {chart.title}
              </h3>
              {loadingChallenges ? (
                <p className="text-center text-gray-600 py-8">
                  Loading chart data...
                </p>
              ) : chart.data.length > 0 &&
                prepareBarChartData(chart.data).labels.length > 0 ? (
                <div className="relative h-64">
                  {" "}
                  {/* Added a fixed height for consistent chart size */}
                  <Bar
                    data={prepareBarChartData(chart.data)}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No data available for this year.
                </p>
              )}
            </div>
          ))}
        </div>
        <hr className="my-6 border-t border-gray-300" />
        {/* Pie Charts for Available Seats */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Challenge Seat Availability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            {
              title: "Weekly Challenges - Available Seats",
              data: challengesData.weekly,
            },
            {
              title: "Monthly Challenges - Available Seats",
              data: challengesData.monthly,
            },
            {
              title: "Mega Challenges - Available Seats",
              data: challengesData.mega,
            },
            {
              title: "Special Events - Available Seats",
              data: challengesData.special_events,
            },
          ].map((chart, idx) => (
            <div
              key={idx}
              className="bg-white border border-purple-200 rounded-xl shadow-md p-4"
            >
              <h3 className="text-xl font-semibold text-black mb-4">
                {chart.title}
              </h3>
              {loadingChallenges ? (
                <p className="text-center text-gray-600 py-8">
                  Loading chart data...
                </p>
              ) : chart.data.length > 0 &&
                preparePieChartData(chart.data).labels.length > 0 ? (
                <div className="relative h-64">
                  <Pie
                    data={preparePieChartData(chart.data)}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No data available for this year.
                </p>
              )}
            </div>
          ))}
        </div>
        <hr className="my-6 border-t border-gray-300" />
        {/* Line Charts for Total Marks */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Challenge Difficulty & Scoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            {
              title: "Weekly Challenges - Total Marks",
              data: challengesData.weekly,
            },
            {
              title: "Monthly Challenges - Total Marks",
              data: challengesData.monthly,
            },
            {
              title: "Mega Challenges - Total Marks",
              data: challengesData.mega,
            },
            {
              title: "Special Events - Total Marks",
              data: challengesData.special_events,
            },
          ].map((chart, idx) => (
            <div
              key={idx}
              className="bg-white border border-purple-200 rounded-xl shadow-md p-4"
            >
              <h3 className="text-xl font-semibold text-black mb-4">
                {chart.title}
              </h3>
              {loadingChallenges ? (
                <p className="text-center text-gray-600 py-8">
                  Loading chart data...
                </p>
              ) : chart.data.length > 0 &&
                prepareLineChartData(chart.data).labels.length > 0 ? (
                <div className="relative h-64">
                  <Line
                    data={prepareLineChartData(chart.data)}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No data available for this year.
                </p>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-purple-900 rounded-sm text-white p-4 shadow-inner">
        <div className="container mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} Admin Dashboard. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* User Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          {" "}
          {/* Changed overlay color */}
          <div className="relative p-8 bg-white w-11/12 md:w-3/4 lg:w-2/3 h-5/6 mx-auto rounded-lg shadow-xl flex flex-col">
            <h2 className="text-2xl font-bold text-black mb-6">
              All User Details
            </h2>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold transition-colors duration-200"
              aria-label="Close modal"
            >
              &times;
            </button>
            {loadingUsers ? (
              <p className="text-center text-gray-600 py-8">
                Loading user details...
              </p>
            ) : allUsers.length > 0 ? (
              <div className="overflow-auto flex-grow border border-gray-200 rounded-md">
                {" "}
                {/* Changed to overflow-auto for scroll */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Full Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Phone No.
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        City
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Country
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.phone_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.country}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No user details available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
