"use client";

export default function WeeklyChallengeForm() {
  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-black text-xl font-bold">Weekly Challenge</h1>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            See All Weekly Challenges
          </button>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Add Exam
        </button>
      </div>

      {/* Form Body */}
      <form className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200">
        {/* Spacer before first input */}
        <div className="h-1" />

        {/* Challenge Name */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Challenge Name
          </label>
          <input
            type="text"
            placeholder="Enter Challenge Name"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Available Seats */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Available Seats
          </label>
          <input
            type="number"
            defaultValue={100000}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Total Marks */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Total Marks
          </label>
          <input
            type="number"
            defaultValue={100}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Duration</label>
          <input
            type="text"
            defaultValue="2 minutes"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Start Time */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="text"
            defaultValue="14 March, 2025, 10:00 am"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">End Time</label>
          <input
            type="text"
            defaultValue="06:00 pm"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Registration Fee */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Registration Fee
          </label>
          <input
            type="number"
            defaultValue={100}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Spacer after last input */}
        <div className="h-4" />
      </form>
    </div>
  );
}
