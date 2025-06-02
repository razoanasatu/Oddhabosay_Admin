"use client";

import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ChallengeRule {
  id: string;
  title: string;
  points: string[];
  challenge_type: string;
}

export default function ChallengeRulesManagement() {
  const [rules, setRules] = useState<ChallengeRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Current rule being edited or null for create
  const [currentRule, setCurrentRule] = useState<ChallengeRule | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState<string[]>([]);
  const [challengeType, setChallengeType] = useState("");

  // Fetch all challenge rules
  const fetchRules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/challenge-rules`);
      if (!res.ok) throw new Error("Failed to fetch challenge rules");
      const data = await res.json();
      setRules(data.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Open modal for create
  const openCreateModal = () => {
    setCurrentRule(null);
    setTitle("");
    setPoints([]);
    setChallengeType("");
    setError("");
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (rule: ChallengeRule) => {
    setCurrentRule(rule);
    setTitle(rule.title);
    setPoints(rule.points);
    setChallengeType(rule.challenge_type);
    setError("");
    setShowModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (rule: ChallengeRule) => {
    setCurrentRule(rule);
    setError("");
    setShowDeleteModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentRule(null);
    setError("");
  };

  // Validate form inputs
  const validateForm = () => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }
    if (points.length === 0 || points.some((p) => !p.trim())) {
      setError("Points cannot be empty");
      return false;
    }
    if (!challengeType.trim()) {
      setError("Challenge Type is required");
      return false;
    }
    setError("");
    return true;
  };

  // Handle create or update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        title,
        points,
        challenge_type: challengeType,
      };

      const url = currentRule
        ? `${baseUrl}/api/challenge-rules/${currentRule.id}`
        : `${baseUrl}/api/challenge-rules`;

      const method = currentRule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save challenge rule");

      await fetchRules();
      closeModals();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentRule) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/challenge-rules/${currentRule.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete challenge rule");
      await fetchRules();
      closeModals();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Challenge Rules</h1>
        <button
          onClick={openCreateModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          Add Rule
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading && !showModal && !showDeleteModal ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Points</th>
                <th className="border px-4 py-2">Challenge Type</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No challenge rules found.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="border-t">
                    <td className="border px-4 py-2 font-semibold">
                      {rule.title}
                    </td>
                    <td className="border px-4 py-2 max-w-md whitespace-pre-wrap">
                      {rule.points.join("\n")}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {rule.challenge_type}
                    </td>
                    <td className="border px-4 py-2 text-center flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(rule)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded shadow p-6 overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {currentRule ? "Edit Challenge Rule" : "Add Challenge Rule"}
              </h2>
              <button onClick={closeModals}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="flex flex-col">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 mt-1"
                  required
                />
              </div>

              {/* Points */}
              <div className="flex flex-col">
                <label
                  htmlFor="points"
                  className="text-sm font-medium text-gray-700"
                >
                  Points (one per line)
                </label>
                <textarea
                  id="points"
                  rows={5}
                  value={points.join("\n")}
                  onChange={(e) => setPoints(e.target.value.split("\n"))}
                  className="border border-gray-300 rounded-md p-2 mt-1"
                  required
                />
              </div>

              {/* Challenge Type */}
              <div className="flex flex-col">
                <label
                  htmlFor="challengeType"
                  className="text-sm font-medium text-gray-700"
                >
                  Challenge Type
                </label>
                <input
                  id="challengeType"
                  type="text"
                  value={challengeType}
                  onChange={(e) => setChallengeType(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 mt-1"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : currentRule ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentRule && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the challenge rule:{" "}
              <strong>{currentRule.title}</strong>?
            </p>
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="flex justify-center gap-4">
              <button
                onClick={closeModals}
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
