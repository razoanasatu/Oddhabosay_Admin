"use client";
import { baseUrl } from "@/utils/constant";
import { useState } from "react";

export default function AddPrizeDetails() {
  interface PrizePosition {
    position: string;
    prize_money: number;
    user_number: number;
    limit: number;
  }

  const [prizePositions, setPrizePositions] = useState<PrizePosition[]>([
    { position: "", prize_money: 0, user_number: 0, limit: 0 },
  ]);

  const [globalBoard, setGlobalBoard] = useState(false);
  const [monthlyEligibility, setMonthlyEligibility] = useState(0);
  const [weeklyEligibility, setWeeklyEligibility] = useState(0);

  const handlePrizeChange = (
    index: number,
    field: keyof PrizePosition,
    value: string | number
  ) => {
    const updated = [...prizePositions];
    updated[index] = {
      ...updated[index],
      [field]: field === "position" ? value : Number(value),
    };
    setPrizePositions(updated);
  };

  const addPrizeRow = () => {
    setPrizePositions([
      ...prizePositions,
      { position: "", prize_money: 0, user_number: 0, limit: 0 },
    ]);
  };

  const removePrizeRow = (index: number) => {
    const updated = prizePositions.filter((_, i) => i !== index);
    setPrizePositions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      prize_positions: prizePositions,
      global_board: globalBoard,
      monthly_eligibility: monthlyEligibility,
      weekly_eligibility: weeklyEligibility,
    };

    try {
      const res = await fetch(`${baseUrl}/api/prize-details/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Prize details submitted successfully!");
      } else {
        alert("Failed to submit prize details.");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="p-4 w-full min-h-screen">
      <h1 className="text-xl font-bold mb-4">Add Prize Details</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md p-6 border border-gray-200 space-y-6"
      >
        {/* Prize Positions Table */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Prize Positions</h2>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Position</th>
                  <th className="border px-3 py-2">Prize Money</th>
                  <th className="border px-3 py-2">User Number</th>
                  <th className="border px-3 py-2">Limit</th>
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {prizePositions.map((prize, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={prize.position}
                        onChange={(e) =>
                          handlePrizeChange(index, "position", e.target.value)
                        }
                        className="w-full border p-1 rounded"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={prize.prize_money}
                        onChange={(e) =>
                          handlePrizeChange(
                            index,
                            "prize_money",
                            e.target.value
                          )
                        }
                        className="w-full border p-1 rounded"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={prize.user_number}
                        onChange={(e) =>
                          handlePrizeChange(
                            index,
                            "user_number",
                            e.target.value
                          )
                        }
                        className="w-full border p-1 rounded"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        value={prize.limit}
                        onChange={(e) =>
                          handlePrizeChange(index, "limit", e.target.value)
                        }
                        className="w-full border p-1 rounded"
                        required
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removePrizeRow(index)}
                        className="text-red-500 hover:underline"
                        disabled={prizePositions.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addPrizeRow}
              className="mt-3 px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add Row
            </button>
          </div>
        </div>

        {/* Other Fields */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={globalBoard}
              onChange={() => setGlobalBoard(!globalBoard)}
            />
            Global Board
          </label>

          <label>
            Monthly Eligibility:{" "}
            <input
              type="number"
              value={monthlyEligibility}
              onChange={(e) => setMonthlyEligibility(Number(e.target.value))}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>

          <label>
            Weekly Eligibility:{" "}
            <input
              type="number"
              value={weeklyEligibility}
              onChange={(e) => setWeeklyEligibility(Number(e.target.value))}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded px-6 py-2 transition"
          >
            Submit Prize Details
          </button>
        </div>
      </form>
    </div>
  );
}
