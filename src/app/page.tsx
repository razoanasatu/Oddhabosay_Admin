"use client";

import { useEffect, useState } from "react";

// Define a type for your user data for better type safety
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

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState<number | string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // State to store all user details
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [loadingUsers, setLoadingUsers] = useState(true); // State to manage loading indicator for users fetch

  const [cardsData, setCardsData] = useState([
    {
      title: "Total Users",
      number: null as number | string | null, // Type assertion to allow string for "N/A"
      description:
        "Active users registered on the platform this month across all regions.",
    },
    {
      title: "User Engagement",
      description: "Statistics on user activity and engagement metrics.",
    },
    {
      title: "Inventory Status",
      description: "Current stock levels and inventory alerts.",
    },
    {
      title: "New Orders",
      description: "Recent orders and their statuses.",
    },
    {
      title: "Support Tickets",
      description: "Open tickets and response time overview.",
    },
    {
      title: "Revenue Forecast",
      description: "Projected revenue based on recent trends.",
    },
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true); // Indicate loading has started
      try {
        const response = await fetch(
          "https://api.backend.oddhabosay.code-studio4.com/api/users"
        );
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          const userCount = data.data.length;
          setTotalUsers(userCount);
          setAllUsers(data.data); // Store all user data

          setCardsData((prevCardsData) =>
            prevCardsData.map((card) =>
              card.title === "Total Users"
                ? { ...card, number: userCount.toString() } // Convert number to string for display consistency
                : card
            )
          );
        } else {
          console.error(
            "Failed to fetch users or data format is incorrect:",
            data
          );
          setTotalUsers("N/A"); // Set to N/A on API response error
          setAllUsers([]); // Clear user list on error
          setCardsData((prevCardsData) =>
            prevCardsData.map((card) =>
              card.title === "Total Users"
                ? { ...card, number: "N/A" } // Update card with "N/A"
                : card
            )
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setTotalUsers("N/A"); // Set to N/A on network/fetch error
        setAllUsers([]); // Clear user list on error
        setCardsData((prevCardsData) =>
          prevCardsData.map((card) =>
            card.title === "Total Users"
              ? { ...card, number: "N/A" } // Update card with "N/A"
              : card
          )
        );
      } finally {
        setLoadingUsers(false); // Indicate loading has finished
      }
    };

    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on component mount

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Total Users") {
      setIsModalOpen(true); // Open the modal
    }
    // Extend with other card click functionalities if needed
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="p-4 w-full min-h-screen bg-gray-100">
      <h1 className="text-black text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onClick={() => handleCardClick(card.title)} // Attach click handler
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
                {card.number !== null ? ( // Display number if available
                  <p className="text-xl font-semibold text-black">
                    {card.number}
                  </p>
                ) : (
                  // Show loading text specifically for Total Users card before fetch
                  card.title === "Total Users" && (
                    <p className="text-xl font-semibold text-gray-400">
                      Loading...
                    </p>
                  )
                )}
                <p className="text-sm text-gray-500 mt-2">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for User Details - Conditionally rendered based on isModalOpen state */}
      {isModalOpen && (
        // Changed overlay classes to your specified ones
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative p-8 bg-white w-11/12 h-5/6 mx-auto rounded-lg shadow-xl flex flex-col">
            {" "}
            {/* Made modal content much larger */}
            <h2 className="text-2xl font-bold text-black mb-6">
              All User Details
            </h2>
            <button
              onClick={closeModal} // Close button handler
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
            >
              &times; {/* Standard close icon */}
            </button>
            {loadingUsers ? (
              <p className="text-center text-gray-600 py-8">
                Loading user details...
              </p>
            ) : allUsers.length > 0 ? (
              <div className="overflow-x-auto flex-grow">
                {" "}
                {/* `flex-grow` makes it take available space, removed max-h-[70vh] */}
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Hydration error fix: <tr> directly after <thead> */}
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
                      {/* Add more table headers as needed for other user properties */}
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
                        {/* Add more table data cells for other user properties */}
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
