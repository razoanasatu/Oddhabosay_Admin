"use client";

import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

type ChallengeRequirement = {
  id: number;
  name: string;
  number_of_practice_challenges: number;
  number_of_weekly_challenges: number;
  number_of_monthly_challenges: number;
  number_of_mega_challenges: number;
  number_of_special_event_challenges: number;
  number_of_practice_questions_solved: number;
};

const ChallengeRequirementManagement = () => {
  const [requirements, setRequirements] = useState<ChallengeRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Omit<
    ChallengeRequirement,
    "id"
  > | null>(null);
  const [selected, setSelected] = useState<ChallengeRequirement | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/challenge-requirement`);
      const json = await res.json();
      if (json.success) {
        setRequirements(json.data);
      } else {
        setError("Failed to fetch data.");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: name === "name" ? value : Number(value),
          }
        : null
    );
  };

  const resetForm = () => {
    setFormData(null);
    setSelected(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!formData) {
      setError("Form is incomplete.");
      return;
    }
    try {
      const endpoint = selected
        ? `${baseUrl}/api/challenge-requirement/${selected.id}`
        : `${baseUrl}/api/challenge-requirement`;

      const method = selected ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowFormModal(false);
        resetForm();
        fetchRequirements();
      } else {
        setError("Failed to save data.");
      }
    } catch (err) {
      console.error("Submit error", err);
      setError("Submission error.");
    }
  };

  const deleteRequirement = async () => {
    if (!selected) return;
    try {
      const res = await fetch(
        `${baseUrl}/api/challenge-requirement/${selected.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        fetchRequirements();
        setShowDeleteModal(false);
        setSelected(null);
      } else {
        setError("Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      setError("Delete error.");
    }
  };

  const openCreateForm = () => {
    setFormData({
      name: "",
      number_of_practice_challenges: 0,
      number_of_weekly_challenges: 0,
      number_of_monthly_challenges: 0,
      number_of_mega_challenges: 0,
      number_of_special_event_challenges: 0,
      number_of_practice_questions_solved: 0,
    });
    setSelected(null);
    setError("");
    setShowFormModal(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Challenge Requirements</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          <Plus size={18} /> Add Requirement
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-sm font-semibold text-left">Name</th>
              <th className="p-3 text-sm font-semibold text-left">
                Practice Qs Solved
              </th>
              <th className="p-3 text-sm font-semibold text-left">Practice</th>
              <th className="p-3 text-sm font-semibold text-left">Weekly</th>
              <th className="p-3 text-sm font-semibold text-left">Monthly</th>
              <th className="p-3 text-sm font-semibold text-left">Mega</th>
              <th className="p-3 text-sm font-semibold text-left">Special</th>
              <th className="p-3 text-sm font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : requirements.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No requirements found.
                </td>
              </tr>
            ) : (
              requirements.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">
                    {r.number_of_practice_questions_solved}
                  </td>
                  <td className="p-3">{r.number_of_practice_challenges}</td>
                  <td className="p-3">{r.number_of_weekly_challenges}</td>
                  <td className="p-3">{r.number_of_monthly_challenges}</td>
                  <td className="p-3">{r.number_of_mega_challenges}</td>
                  <td className="p-3">
                    {r.number_of_special_event_challenges}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelected(r);
                        const { id, createdAt, updatedAt, ...rest } = r as any;
                        setFormData(rest);
                        setShowFormModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(r);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selected ? "Edit Requirement" : "Create Requirement"}
              </h2>
              <button onClick={() => setShowFormModal(false)}>
                <X size={24} />
              </button>
            </div>

            {formData ? (
              <>
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type={key === "name" ? "text" : "text"}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded appearance-none"
                      inputMode={key === "name" ? undefined : "numeric"}
                      pattern={key === "name" ? undefined : "[0-9]*"}
                    />
                  </div>
                ))}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {selected ? "Update" : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Loading form...</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
            <p>Are you sure you want to delete this challenge requirement?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteRequirement}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeRequirementManagement;
