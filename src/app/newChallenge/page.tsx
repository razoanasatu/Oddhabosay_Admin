"use client";

export default function SpecialEventsDashboard() {
  return (
    <div className="relative min-h-screen p-6">
      {/* Button fixed at top right of viewport */}
      <button className="fixed top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded z-50">
        Create Special Events
      </button>

      {/* Main content area */}
      <div className="pt-16 flex flex-col">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 mb-4">
          {" "}
          {/* Added mb-4 for spacing */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Special Events
          </h2>
          <div className="space-y-4">
            {/* Total Special Events */}
            <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-2 left-2 flex">
                <div className="w-4 h-4 rounded-full bg-pink-200 -ml-2 -mt-1"></div>
                <div className="w-4 h-4 rounded-full bg-blue-200 -ml-1 -mt-0.5"></div>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">
                Total Special Events
              </h3>
              <p className="text-2xl font-bold text-indigo-700">9</p>
              <p className="text-sm text-gray-500">
                A summary of all the amazing events planned.
              </p>
            </div>

            {/* Total Participants */}
            <div className="bg-white shadow rounded-lg p-4 relative overflow-hidden">
              <div className="absolute bottom-2 left-2 flex">
                <div className="w-4 h-4 rounded-full bg-pink-200 -ml-2 -mb-1"></div>
                <div className="w-4 h-4 rounded-full bg-blue-200 -ml-1 -mb-0.5"></div>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">Total Participants</h3>
              <p className="text-2xl font-bold text-green-700">250</p>
              <p className="text-sm text-gray-500">
                Total number of enthusiastic participants so far.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Grid (Now below the left sidebar) */}
        <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-lg p-4 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded">
                  View Details
                </button>
              </div>
              <div className="absolute top-2 left-2 flex">
                <div className="w-4 h-4 rounded-full bg-pink-200 -ml-2 -mt-1"></div>
                <div className="w-4 h-4 rounded-full bg-blue-200 -ml-1 -mt-0.5"></div>
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Special Event
              </h4>
              <p className="text-xl font-bold text-indigo-700">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="absolute bottom-2 left-2 flex">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                  {/* Replace with your image */}
                  <img
                    src={`https://via.placeholder.com/40?text=Img`}
                    alt={`Event ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-right text-xs text-gray-600">
                <p>Time: 10:00 AM</p>
                <p>Location: Banani, Dhaka</p>
              </div>
            </div>
          ))}
          {/* Handle odd number of items for consistent grid */}
          {Array.from({ length: 9 % 2 === 1 ? 1 : 0 }).map((_, index) => (
            <div key={`empty-${index}`} className="hidden sm:block"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
