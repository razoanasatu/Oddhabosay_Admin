"use client";

import { Plus, RefreshCw, Save, Settings, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Define baseUrl - IMPORTANT: Replace with your actual base URL
import { baseUrl } from "@/utils/constant";

// Type definitions
type Subject = {
  id: number;
  name: string;
};

type CustomRatios = {
  [subjectId: string]: number;
};

const QuestionDistribution = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAutoDistributionEnabled, setIsAutoDistributionEnabled] =
    useState(true);
  const [customSubjectRatios, setCustomSubjectRatios] = useState<CustomRatios>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSubjectRatioModal, setShowSubjectRatioModal] = useState(false);
  const [selectedSubjectForRatio, setSelectedSubjectForRatio] =
    useState<Subject | null>(null);
  const [individualSubjectRatio, setIndividualSubjectRatio] = useState<
    number | string
  >("");

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
    // NOTE: We cannot fetch the current distribution config as there is no GET API.
    // The component will now manage the state locally and only POST to save.
  }, []);

  // Calculate sum of custom ratios
  const totalCustomRatio = Object.values(customSubjectRatios).reduce(
    (sum, ratio) => sum + ratio,
    0
  );

  // --- API Calls ---

  // Fetches the list of subjects (assuming this is a separate, valid GET endpoint)
  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/subjects`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      } else {
        setError(data.message || "Failed to fetch subjects list.");
        toast.error(data.message || "Failed to fetch subjects list.");
      }
    } catch (err) {
      setError("Error fetching subjects. Please try again.");
      toast.error("Error fetching subjects. Please try again.");
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Updates the global distribution configuration via POST
  const updateDistributionConfig = async () => {
    setLoading(true);
    setError("");

    if (!isAutoDistributionEnabled && totalCustomRatio !== 1) {
      setError(
        "Total custom ratio must sum up to 1 (e.g., 0.4 + 0.3 + 0.3 = 1.0)"
      );
      toast.error("Total custom ratio must sum up to 1!");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        isAutoDistributionEnabled,
        customSubjectRatios: isAutoDistributionEnabled
          ? {}
          : customSubjectRatios,
      };

      const response = await fetch(
        `${baseUrl}/api/distribution-of-questions/config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success || response.ok) {
        toast.success("Distribution configuration updated successfully!");
        setShowConfigModal(false);
      } else {
        setError(
          data.message || "Failed to update distribution configuration."
        );
        toast.error(
          data.message || "Failed to update distribution configuration."
        );
      }
    } catch (err) {
      setError("Error updating configuration. Please try again.");
      toast.error("Error updating configuration. Please try again.");
      console.error("Error updating config:", err);
    } finally {
      setLoading(false);
    }
  };

  // Updates the ratio for a specific subject via POST
  const updateSpecificSubjectRatio = async () => {
    if (!selectedSubjectForRatio) {
      setError("Please select a subject.");
      toast.error("Please select a subject.");
      return;
    }
    const ratioValue = parseFloat(individualSubjectRatio as string);
    if (isNaN(ratioValue) || ratioValue <= 0 || ratioValue > 1) {
      setError("Ratio must be a number between 0 and 1.");
      toast.error("Ratio must be a number between 0 and 1.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        subjectId: selectedSubjectForRatio.id,
        ratio: ratioValue,
      };

      const response = await fetch(
        `${baseUrl}/api/distribution-of-questions/subject-ratio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success || response.ok) {
        toast.success(
          `Ratio for ${selectedSubjectForRatio.name} updated successfully!`
        );
        // Update the local state to reflect the new ratio
        setCustomSubjectRatios((prev) => ({
          ...prev,
          [selectedSubjectForRatio.id]: ratioValue,
        }));
        setShowSubjectRatioModal(false);
        setSelectedSubjectForRatio(null);
        setIndividualSubjectRatio("");
      } else {
        setError(data.message || "Failed to update specific subject ratio.");
        toast.error(data.message || "Failed to update specific subject ratio.");
      }
    } catch (err) {
      setError("Error updating subject ratio. Please try again.");
      toast.error("Error updating subject ratio. Please try again.");
      console.error("Error updating subject ratio:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for UI interactions ---

  const handleRatioChange = (subjectId: number, value: string) => {
    const ratio = parseFloat(value);
    setCustomSubjectRatios((prev) => ({
      ...prev,
      [subjectId]: isNaN(ratio) ? 0 : ratio,
    }));
  };

  const handleAddSubjectToCustomRatios = (subject: Subject) => {
    if (!(subject.id in customSubjectRatios)) {
      setCustomSubjectRatios((prev) => ({
        ...prev,
        [subject.id]: 0,
      }));
    }
  };

  const handleRemoveSubjectFromCustomRatios = (subjectId: number) => {
    setCustomSubjectRatios((prev) => {
      const newRatios = { ...prev };
      delete newRatios[subjectId];
      return newRatios;
    });
  };

  // New handler to simulate fetching initial data or resetting locally
  const handleRefreshConfig = () => {
    setIsAutoDistributionEnabled(true);
    setCustomSubjectRatios({});
    toast.info("Local configuration has been reset to default.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-purple-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-4 sm:mb-0">
            Practice Question Distribution
          </h1>
          <div className="flex gap-3">
            {/* Added a refresh button to simulate fetching/resetting */}
            <button
              onClick={handleRefreshConfig}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw size={22} strokeWidth={2.5} />
              Reset Local Config
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Settings size={22} strokeWidth={2.5} />
              Global Settings
            </button>
            <button
              onClick={() => setShowSubjectRatioModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus size={22} strokeWidth={2.5} />
              Set Specific Ratio
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg mb-6 flex items-center shadow-md animate-fade-in"
            role="alert"
          >
            <X className="h-5 w-5 mr-3" />
            <div>
              <p className="font-semibold">Error!</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Current Configuration Display */}
        <div className="bg-purple-50 p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            Current Distribution Status (Local)
          </h2>
          <p className="text-lg text-gray-700 mb-2">
            Auto Distribution:{" "}
            <span
              className={`font-semibold ${
                isAutoDistributionEnabled ? "text-green-600" : "text-red-600"
              }`}
            >
              {isAutoDistributionEnabled ? "Enabled" : "Disabled"}
            </span>
          </p>
          {!isAutoDistributionEnabled &&
            Object.keys(customSubjectRatios).length > 0 && (
              <div>
                <p className="text-lg text-gray-700 font-semibold mt-4 mb-2">
                  Custom Ratios:
                </p>
                <ul className="list-disc list-inside text-gray-700">
                  {Object.entries(customSubjectRatios).map(
                    ([subjectId, ratio]) => {
                      const subjectName =
                        subjects.find((s) => s.id === parseInt(subjectId))
                          ?.name || `Subject ${subjectId}`;
                      return (
                        <li key={subjectId} className="mb-1">
                          <span className="font-medium">{subjectName}:</span>{" "}
                          {(ratio * 100).toFixed(1)}%
                        </li>
                      );
                    }
                  )}
                </ul>
                <p className="text-lg text-gray-700 font-semibold mt-4">
                  Total Custom Ratio: {(totalCustomRatio * 100).toFixed(1)}%
                  {totalCustomRatio !== 1 && (
                    <span className="text-red-500 ml-2">(Should be 100%)</span>
                  )}
                </p>
              </div>
            )}
          {!isAutoDistributionEnabled &&
            Object.keys(customSubjectRatios).length === 0 && (
              <p className="text-gray-600 italic">
                No custom ratios set. Please configure in Global Settings.
              </p>
            )}
        </div>

        {/* Global Settings Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowConfigModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close global settings modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Global Distribution Settings
              </h2>

              <div className="mb-6 flex items-center justify-between">
                <label
                  htmlFor="auto-dist-toggle"
                  className="text-lg font-medium text-gray-700"
                >
                  Enable Auto Distribution
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="auto-dist-toggle"
                    className="sr-only peer"
                    checked={isAutoDistributionEnabled}
                    onChange={() =>
                      setIsAutoDistributionEnabled((prev) => !prev)
                    }
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {!isAutoDistributionEnabled && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">
                    Custom Subject Ratios
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Set custom ratios for subjects. The sum of all ratios should
                    be 1 (e.g., 0.2, 0.5, 0.3).
                  </p>
                  <div className="max-h-60 overflow-y-auto pr-2 mb-4">
                    {subjects.length === 0 && !loading ? (
                      <p className="text-gray-500 italic">
                        No subjects available to set custom ratios.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {subjects.map((subject) => (
                          <li
                            key={subject.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                          >
                            <span className="font-medium text-gray-800">
                              {subject.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={customSubjectRatios[subject.id] || ""}
                                onChange={(e) =>
                                  handleRatioChange(subject.id, e.target.value)
                                }
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm text-center"
                                placeholder="Ratio (0-1)"
                                disabled={!(subject.id in customSubjectRatios)}
                              />
                              {subject.id in customSubjectRatios ? (
                                <button
                                  onClick={() =>
                                    handleRemoveSubjectFromCustomRatios(
                                      subject.id
                                    )
                                  }
                                  className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                  title="Remove from custom ratios"
                                >
                                  <Trash2 size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleAddSubjectToCustomRatios(subject)
                                  }
                                  className="p-1.5 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                  title="Add to custom ratios"
                                >
                                  <Plus size={18} />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p
                    className={`text-lg font-semibold mt-4 ${
                      totalCustomRatio === 1 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    Current Sum: {totalCustomRatio.toFixed(2)}
                    {totalCustomRatio !== 1 && (
                      <span className="ml-2 text-sm">(Must be 1.00)</span>
                    )}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={updateDistributionConfig}
                  disabled={
                    loading ||
                    (!isAutoDistributionEnabled && totalCustomRatio !== 1)
                  }
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <>
                      <Save size={20} /> Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Specific Subject Ratio Modal */}
        {showSubjectRatioModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowSubjectRatioModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors text-2xl font-semibold"
                aria-label="Close specific subject ratio modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Set Specific Subject Ratio
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="subject-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Subject
                </label>
                <select
                  id="subject-select"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  value={selectedSubjectForRatio?.id || ""}
                  onChange={(e) => {
                    const subjectId = parseInt(e.target.value);
                    setSelectedSubjectForRatio(
                      subjects.find((s) => s.id === subjectId) || null
                    );
                  }}
                  aria-required="true"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="ratio-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ratio (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  id="ratio-input"
                  value={individualSubjectRatio}
                  onChange={(e) => setIndividualSubjectRatio(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base shadow-sm"
                  placeholder="e.g., 0.35"
                  aria-required="true"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSubjectRatioModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSpecificSubjectRatio}
                  disabled={
                    loading ||
                    !selectedSubjectForRatio ||
                    individualSubjectRatio === ""
                  }
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <>
                      <Save size={20} /> Save Ratio
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDistribution;
