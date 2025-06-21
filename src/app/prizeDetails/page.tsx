"use client";

import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PrizePosition {
  threshold?: number; // Now a number
  position: string;
  prize_money: number;
  user_number: number;
  limit: number;
}

interface PrizeDetails {
  id: string | number;
  prize_structure: Record<string, PrizePosition[]>;
  prize_positions?: PrizePosition[]; // Flattened for UI use
  global_board: boolean;
  monthly_eligibility: number;
  weekly_eligibility: number;
}

export default function PrizeDetailsManagement() {
  const [prizeDetailsList, setPrizeDetailsList] = useState<PrizeDetails[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrizeDetails, setSelectedPrizeDetails] =
    useState<PrizeDetails | null>(null);

  const [prizePositions, setPrizePositions] = useState<PrizePosition[]>([
    { threshold: 0, position: "", prize_money: 0, user_number: 0, limit: 0 },
  ]);
  const [globalBoard, setGlobalBoard] = useState(false);
  const [monthlyEligibility, setMonthlyEligibility] = useState(0);
  const [weeklyEligibility, setWeeklyEligibility] = useState(0);

  const fetchPrizeDetails = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/prize-details`);
      const data = await res.json();
      if (res.ok) {
        const transformed = data.data.map((item: any) => {
          const prize_positions: PrizePosition[] = [];
          for (const [threshold, positions] of Object.entries(
            item.prize_structure || {}
          )) {
            (positions as PrizePosition[]).forEach((pos) =>
              prize_positions.push({
                ...pos,
                threshold: Number(threshold),
              })
            );
          }
          return { ...item, prize_positions };
        });
        setPrizeDetailsList(transformed);
      } else {
        setError("Failed to load prize details.");
      }
    } catch {
      setError("Error fetching prize details.");
    }
  };

  useEffect(() => {
    fetchPrizeDetails();
  }, []);

  const resetForm = () => {
    setPrizePositions([
      { threshold: 0, position: "", prize_money: 0, user_number: 0, limit: 0 },
    ]);
    setGlobalBoard(false);
    setMonthlyEligibility(0);
    setWeeklyEligibility(0);
    setError("");
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedPrizeDetails(null);
    setShowCreateModal(true);
  };

  const openEditModal = (details: PrizeDetails) => {
    setSelectedPrizeDetails(details);
    setPrizePositions(details.prize_positions || []);
    setGlobalBoard(details.global_board);
    setMonthlyEligibility(details.monthly_eligibility);
    setWeeklyEligibility(details.weekly_eligibility);
    setShowEditModal(true);
    setError("");
  };

  const openDeleteModal = (details: PrizeDetails) => {
    setSelectedPrizeDetails(details);
    setShowDeleteModal(true);
  };

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
      { threshold: 0, position: "", prize_money: 0, user_number: 0, limit: 0 },
    ]);
  };

  const removePrizeRow = (index: number) => {
    const updated = prizePositions.filter((_, i) => i !== index);
    setPrizePositions(
      updated.length
        ? updated
        : [
            {
              threshold: 0,
              position: "",
              prize_money: 0,
              user_number: 0,
              limit: 0,
            },
          ]
    );
  };
  const [thresholdGroups, setThresholdGroups] = useState([
    {
      threshold: 1, // Threshold value for this group
      prizes: [{ position: "", prize_money: "", user_number: "", limit: "" }],
    },
  ]);

  const buildPrizeStructure = () => {
    const structure: Record<string, PrizePosition[]> = {};
    for (const pos of prizePositions) {
      const key = pos.threshold?.toString();
      if (!key) continue;
      if (!structure[key]) structure[key] = [];
      const { threshold, ...rest } = pos;
      structure[key].push(rest);
    }
    return structure;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        prize_structure: buildPrizeStructure(),
        global_board: globalBoard,
        monthly_eligibility: monthlyEligibility,
        weekly_eligibility: weeklyEligibility,
      };

      const res = await fetch(`${baseUrl}/api/prize-details/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchPrizeDetails();
      } else {
        setError("Failed to add prize details.");
      }
    } catch {
      setError("Error adding prize details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPrizeDetails || !validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        prize_structure: buildPrizeStructure(),
        global_board: globalBoard,
        monthly_eligibility: monthlyEligibility,
        weekly_eligibility: weeklyEligibility,
      };

      const res = await fetch(
        `${baseUrl}/api/prize-details/${selectedPrizeDetails.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setShowEditModal(false);
        resetForm();
        fetchPrizeDetails();
      } else {
        setError("Failed to update prize details.");
      }
    } catch {
      setError("Error updating prize details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPrizeDetails) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/prize-details/${selectedPrizeDetails.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setShowDeleteModal(false);
        fetchPrizeDetails();
      } else {
        setError("Failed to delete prize details.");
      }
    } catch {
      setError("Error deleting prize details.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (prizePositions.length === 0) {
      setError("Add at least one prize position.");
      return false;
    }
    for (const p of prizePositions) {
      if (
        typeof p.threshold !== "number" ||
        p.threshold <= 0 ||
        !p.position.trim()
      ) {
        setError(
          "Threshold must be a number > 0 and position must not be empty."
        );
        return false;
      }
      if (p.prize_money <= 0 || p.user_number <= 0 || p.limit <= 0) {
        setError("Prize money, user number, and limit must be > 0.");
        return false;
      }
    }
    setError("");
    return true;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prize Details</h1>
        <button
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          Add Prize Details
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full leading-normal bg-white">
          <thead className="bg-gradient-to-r from-purple-600 to-blue-800">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-700">
                Position & Prize Breakdown
              </th>
              <th className="px-6 py-5 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-700">
                Global Board
              </th>
              <th className="px-6 py-5 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-700">
                Monthly Eligibility
              </th>
              <th className="px-6 py-5 text-center text-xs font-semibold text-white uppercase tracking-wider border-r border-blue-700">
                Weekly Eligibility
              </th>
              <th className="px-6 py-5 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {prizeDetailsList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500 text-lg italic"
                >
                  No prize details found. Please add new entries.
                </td>
              </tr>
            ) : (
              prizeDetailsList.map((details) => (
                <tr
                  key={details.id}
                  className="border-b border-gray-200 hover:bg-purple-50 transition-colors duration-200 ease-in-out"
                >
                  <td className="px-6 py-4 border-r border-gray-200">
                    {details.prize_positions?.map((p, i) => (
                      <div
                        key={i}
                        className="mb-3 last:mb-0 p-3 bg-gray-50 rounded-md border border-gray-200"
                      >
                        <p className="text-gray-900 font-semibold mb-1">
                          Registered User{" "}
                          <span className="text-purple-700">{p.threshold}</span>
                          :{" "}
                          <span className="text-purple-900">{p.position}</span>
                        </p>
                        <p className="text-gray-700 text-sm">
                          Prize Money:{" "}
                          <span className="font-medium">৳{p.prize_money}</span>{" "}
                          | Target Users:{" "}
                          <span className="font-medium">{p.user_number}</span> |
                          Limit: <span className="font-medium">{p.limit}</span>
                        </p>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-semibold ${
                        details.global_board
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {details.global_board ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 font-medium border-r border-gray-200">
                    {details.monthly_eligibility}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 font-medium border-r border-gray-200">
                    {details.weekly_eligibility}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-4">
                      <button
                        onClick={() => openEditModal(details)}
                        className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out p-1 rounded-full"
                        title="Edit Prize Details"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(details)}
                        className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out p-1 rounded-full"
                        title="Delete Prize Details"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded shadow p-6 overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showCreateModal ? "Add Prize Details" : "Edit Prize Details"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedPrizeDetails(null);
                  resetForm();
                }}
              >
                <X />
              </button>
            </div>

            <div className="overflow-x-auto max-h-60 mb-4">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border px-3 py-2">Registered User</th>
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
                          type="number"
                          value={prize.threshold ?? ""}
                          onChange={(e) =>
                            handlePrizeChange(
                              index,
                              "threshold",
                              e.target.value
                            )
                          }
                          className="w-full border p-1 rounded"
                          min={1}
                          required
                        />
                      </td>
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
                          min={1}
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
                          min={1}
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
                          min={1}
                          required
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button
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
                onClick={addPrizeRow}
                className="mt-3 px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                + Add Row
              </button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={globalBoard}
                  onChange={() => setGlobalBoard(!globalBoard)}
                />
                Global Board
              </label>

              <label>
                Monthly Eligibility:
                <input
                  type="number"
                  value={monthlyEligibility}
                  onChange={(e) =>
                    setMonthlyEligibility(Number(e.target.value))
                  }
                  className="ml-2 border rounded px-2 py-1"
                  min={0}
                />
              </label>

              <label>
                Weekly Eligibility:
                <input
                  type="number"
                  value={weeklyEligibility}
                  onChange={(e) => setWeeklyEligibility(Number(e.target.value))}
                  className="ml-2 border rounded px-2 py-1"
                  min={0}
                />
              </label>
            </div>

            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                  setSelectedPrizeDetails(null);
                  setError("");
                }}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={showCreateModal ? handleCreate : handleUpdate}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : showCreateModal ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPrizeDetails && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this prize detail?
            </p>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPrizeDetails(null);
                  setError("");
                }}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
