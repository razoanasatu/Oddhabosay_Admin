"use client";

export default function SpecialEventsDashboard() {
  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <h1 className="text-black text-xl font-bold">Special Events</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Create Special Events
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Section */}
        <div className="w-full md:w-1/4 space-y-4">
          {/* Total Special Events Card */}
          <div className="bg-white rounded-md shadow p-4 border border-purple-200 relative overflow-hidden flex flex-col h-[200px]">
            {/* Circles on left bottom */}
            <div className="absolute bottom-2 left-2 flex">
              <div className="w-24 h-24 rounded-full bg-blue-300 opacity-30 -ml-8 -mb-8"></div>
              <div className="w-24 h-24 rounded-full bg-pink-300 opacity-30 -ml-10 -mb-10"></div>
            </div>

            {/* Content */}
            <h3 className="text-sm text-gray-600 mb-1 z-10">
              Total Special Events
            </h3>
            <p className="text-2xl font-bold text-indigo-700 z-10">9</p>
            <p className="text-gray-500 text-sm mt-auto z-10">
              Praesent non lacus ut tortor dictum tristique. Fusce sit amet
              tincidunt lectus. Praesent non lacus ut tortor dictum tristique.
              Fusce sit amet tincidunt lectus.
            </p>
          </div>

          {/* Total Participants Card */}
          <div className="bg-white rounded-md shadow p-4 border border-purple-200 relative overflow-hidden flex flex-col h-[200px]">
            {/* Circles on right bottom */}
            <div className="absolute bottom-2 right-2 flex">
              <div className="w-24 h-24 rounded-full bg-pink-300 opacity-30 -mr-8 -mb-8"></div>
              <div className="w-24 h-24 rounded-full bg-blue-300 opacity-30 -mr-10 -mb-10"></div>
            </div>

            {/* Content */}
            <h3 className="text-sm text-gray-600 mb-1 z-10">
              Total Participants
            </h3>
            <p className="text-2xl font-bold text-green-700 z-10">250</p>
            <p className="text-gray-500 text-sm mt-auto z-10">
              Praesent non lacus ut tortor dictum tristique. Fusce sit amet
              tincidunt lectus. Praesent non lacus ut tortor dictum tristique.
              Fusce sit amet tincidunt lectus.
            </p>
          </div>
        </div>

        {/* Right Section - Events Grid */}
        <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-md shadow p-4 border border-purple-200 relative overflow-hidden flex flex-col h-[200px]"
            >
              {/* Circle backgrounds */}
              <>
                <div className="absolute top-2 right-2 flex">
                  <div className="w-24 h-24 rounded-full bg-pink-300 opacity-30 -mr-8 -mt-8"></div>
                  <div className="w-24 h-24 rounded-full bg-blue-300 opacity-30 -mr-10 -mt-10"></div>
                </div>
                <div className="absolute bottom-2 left-2 flex">
                  <div className="w-24 h-24 rounded-full bg-blue-300 opacity-30 -ml-8 -mb-8"></div>
                  <div className="w-24 h-24 rounded-full bg-pink-300 opacity-30 -ml-10 -mb-10"></div>
                </div>
              </>

              {/* View Button */}
              <div className="absolute top-2 right-2 z-10">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md text-xs">
                  View Details
                </button>
              </div>

              {/* Content */}
              <h4 className="text-sm font-semibold text-gray-700 mb-1 z-10">
                Special Event
              </h4>
              <p className="text-xl font-bold text-indigo-700 z-10">
                {String(index + 1).padStart(2, "0")}
              </p>

              {/* Bottom Right Text */}
              <div className="absolute bottom-2 right-2 z-10 text-right">
                <p className="text-gray-600 text-xs">Time: 10:00 AM</p>
                <p className="text-gray-600 text-xs">Location: Bonani Dhaka</p>
              </div>

              {/* Image */}
              <div className="absolute bottom-3 left-3">
                <div className="w-38 h-26 rounded-md bg-gray-300 overflow-hidden">
                  <img
                    src={`Event.png`}
                    alt={`Event ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Balance last column for grid layout */}
          {9 % 2 === 1 && <div className="hidden md:block"></div>}
        </div>
      </div>
    </div>
  );
}
