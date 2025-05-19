"use client";

export default function AddQuestion() {
  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-black text-xl font-bold">Add Questions</h1>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            See All Weekly Challenges
          </button>
        </div>
      </div>

      {/* Form Body */}
      <form className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200">
        {/* Spacer before first input */}
        <div className="h-1" />

        {/* Challenge Name */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Exam Name</label>
          <input
            type="text"
            placeholder="Exam Name"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Select Challenge Category */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Select Challenge Category
          </label>
          <select
            defaultValue=""
            className="border border-gray-300 rounded-md p-2 mt-1 text-gray-700"
          >
            <option value="" disabled>
              Choose Category
            </option>
            <option value="coding">Coding</option>
            <option value="design">Design</option>
            <option value="quiz">Quiz</option>
            <option value="sports">Sports</option>
          </select>
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

        {/* Question No. */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Question No.
          </label>
          <input
            type="text"
            placeholder="Question No."
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Questions Name */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Questions Name
          </label>
          <input
            type="text"
            placeholder="Question Name"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Add Options */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Add Options
          </label>
          <input
            type="text"
            placeholder="A. Option 01"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Add Options */}
        <div className="flex flex-col w-full md:w-1/2 relative">
          <label className="text-sm font-medium text-gray-700">
            Add Options
          </label>
          <input
            type="text"
            placeholder="A. Option 01"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />

          {/* Add More Options clickable text */}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              className="text-purple-600 text-sm hover:underline"
              onClick={() => {
                // Add logic to handle adding more options
                console.log("Add More Options clicked");
              }}
            >
              Add More Options
            </button>
          </div>
        </div>

        {/* Add Save Button */}
        <div className="flex flex-col w-full md:w-1/2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-sm px-8 py-2 transition self-start"
          >
            Save
          </button>
        </div>

        {/* Spacer after last input */}
        <div className="h-4" />
      </form>
    </div>
  );
}
