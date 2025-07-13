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
import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState<number | string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
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
      try {
        const response = await fetch(
          "https://api.backend.oddhabosay.code-studio4.com/api/challenges/all-challenges"
        );
        const data = await response.json();
        setChallengesData(data);

        // Extract available years from the data
        const years = new Set<number>();
        [
          ...data.weekly,
          ...data.monthly,
          ...data.mega,
          ...data.special_events,
        ].forEach((challenge) => {
          const year = new Date(challenge.createdAt).getFullYear();
          years.add(year);
        });
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchUsers();
    fetchChallenges();
  }, []);

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

  const filterChallengesByYear = (challenges: Challenge[]) => {
    return challenges.filter((challenge) => {
      const year = new Date(challenge.createdAt).getFullYear();
      return year === selectedYear;
    });
  };

  const prepareBarChartData = (challenges: Challenge[]) => {
    const filteredChallenges = filterChallengesByYear(challenges);
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
  };

  const preparePieChartData = (challenges: Challenge[]) => {
    const filteredChallenges = filterChallengesByYear(challenges);
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
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareLineChartData = (challenges: Challenge[]) => {
    const filteredChallenges = filterChallengesByYear(challenges);
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
        },
      ],
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-purple-900 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        <div className="mb-4">
          <label htmlFor="year-select" className="mr-2">
            Select Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            className="p-2 border rounded"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

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
                    <p className="text-xl font-semibold text-black">
                      {card.number}
                    </p>
                  ) : (
                    card.title === "Total Users" && (
                      <p className="text-xl font-semibold text-gray-400">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Weekly Challenges - Registered Users
            </h2>
            <Bar data={prepareBarChartData(challengesData.weekly)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Monthly Challenges - Registered Users
            </h2>
            <Bar data={prepareBarChartData(challengesData.monthly)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Mega Challenges - Registered Users
            </h2>
            <Bar data={prepareBarChartData(challengesData.mega)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Special Events - Registered Users
            </h2>
            <Bar data={prepareBarChartData(challengesData.special_events)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Weekly Challenges - Available Seats
            </h2>
            <Pie data={preparePieChartData(challengesData.weekly)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Monthly Challenges - Available Seats
            </h2>
            <Pie data={preparePieChartData(challengesData.monthly)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Mega Challenges - Available Seats
            </h2>
            <Pie data={preparePieChartData(challengesData.mega)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Special Events - Available Seats
            </h2>
            <Pie data={preparePieChartData(challengesData.special_events)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Weekly Challenges - Total Marks
            </h2>
            <Line data={prepareLineChartData(challengesData.weekly)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Monthly Challenges - Total Marks
            </h2>
            <Line data={prepareLineChartData(challengesData.monthly)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Mega Challenges - Total Marks
            </h2>
            <Line data={prepareLineChartData(challengesData.mega)} />
          </div>
          <div className="bg-white border border-purple-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-semibold text-black mb-4">
              Special Events - Total Marks
            </h2>
            <Line data={prepareLineChartData(challengesData.special_events)} />
          </div>
        </div>
      </main>

      <footer className="bg-purple-900 text-white p-4 shadow-inner">
        <div className="container mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} Admin Dashboard. All rights
            reserved.
          </p>
        </div>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative p-8 bg-white w-11/12 h-5/6 mx-auto rounded-lg shadow-xl flex flex-col">
            <h2 className="text-2xl font-bold text-black mb-6">
              All User Details
            </h2>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
            >
              &times;
            </button>
            {loadingUsers ? (
              <p className="text-center text-gray-600 py-8">
                Loading user details...
              </p>
            ) : allUsers.length > 0 ? (
              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Full Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone No.
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        City
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Country
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <tr key={user.id}>
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
