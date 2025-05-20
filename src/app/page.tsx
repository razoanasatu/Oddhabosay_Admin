"use client";

export default function Dashboard() {
  const cardsData = [
    {
      title: "Total Users",
      number: "4100",
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
  ];

  return (
    <div className="p-4 w-full min-h-screen bg-gray-100">
      <h1 className="text-black text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsData.map((card, index) => {
          const isEven = (index + 1) % 2 === 0;

          return (
            <div
              key={index}
              className="relative bg-white border border-purple-200 rounded-xl shadow-md p-6 h-44 overflow-hidden"
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
                {card.number && (
                  <p className="text-xl font-semibold text-black">
                    {card.number}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
