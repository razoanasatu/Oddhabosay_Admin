"use client";

import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
};

type Question = {
  id: number;
  question: string;
  answers: string[];
  correct_answer: number;
  subjectId: number;
  subject?: Subject; // Optional, as it might be populated after fetching subjects
  eligibility_flag: string[];
  score: number;
};

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<Omit<Question, "id">>({
    question: "",
    answers: ["", "", "", ""],
    correct_answer: 0,
    subjectId: 0,
    eligibility_flag: ["weekly"],
    score: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  // Removed: searchKeyword state as this page is for management, not selection/search.

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/question-bank`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
      } else {
        setError(json.message || "Failed to load questions.");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/subjects`);
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data);
        // Set default subjectId if not already set, using the first subject from fetched data
        if (!formData.subjectId && json.data.length > 0) {
          setFormData((prev) => ({ ...prev, subjectId: json.data[0].id }));
        }
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }, [formData.subjectId]); // Dependency added to ensure it re-runs if formData.subjectId changes from outside

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = selectedQuestion
        ? `${baseUrl}/api/question-bank/${selectedQuestion.id}`
        : `${baseUrl}/api/question-bank/add`;

      const method = selectedQuestion ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowCreateModal(false);
        setShowEditModal(false);
        fetchQuestions(); // Refresh the list of questions
        resetForm(); // Clear the form after submission
      } else {
        setError(json.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Submission error. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async () => {
    if (!selectedQuestion) return; // Should not happen if modal is correctly controlled
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/question-bank/${selectedQuestion.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        fetchQuestions(); // Refresh the list after deletion
        setShowDeleteModal(false);
        setSelectedQuestion(null); // Clear selected question
      } else {
        const json = await res.json();
        setError(json.message || "Deletion failed.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Delete failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answers: ["", "", "", ""],
      correct_answer: 0,
      // Set subjectId to the first available subject if subjects exist
      subjectId: subjects.length > 0 ? subjects[0].id : 0,
      eligibility_flag: ["weekly"],
      score: 10,
    });
    setSelectedQuestion(null);
    setError("");
  };

  // Removed: filteredQuestions logic, as search is removed from this page.
  // The table will now directly display the 'questions' state.

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            Question Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out shadow-md"
          >
            <Plus size={18} /> Add New Question
          </button>
        </div>

        {/* Removed: Search bar section */}

        {error && (
          <div className="text-red-700 bg-red-100 border border-red-300 px-4 py-3 rounded-md mb-6 shadow-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Question
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Score
                </th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-lg text-blue-500"
                  >
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-gray-500 text-lg"
                  >
                    No questions available. Click "Add New Question" to get
                    started.
                  </td>
                </tr>
              ) : (
                questions.map(
                  (
                    q // Directly map over 'questions' state
                  ) => (
                    <tr
                      key={q.id}
                      className="border-t hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="p-4 text-gray-900 max-w-lg overflow-hidden text-ellipsis whitespace-nowrap">
                        {q.question}
                      </td>
                      <td className="p-4 text-gray-700">
                        {q.subject?.name || "N/A"}{" "}
                        {/* Display subject name directly */}
                      </td>
                      <td className="p-4 text-gray-700">{q.score}</td>
                      <td className="p-4 text-right flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setFormData({
                              question: q.question,
                              answers: q.answers,
                              correct_answer: q.correct_answer,
                              subjectId: q.subjectId,
                              eligibility_flag: q.eligibility_flag,
                              score: q.score,
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                          title="Edit Question"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                          title="Delete Question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg space-y-5 transform transition-all duration-300 scale-100 opacity-100">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {showEditModal ? "Edit Question" : "Create New Question"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm(); // Ensure form is reset on close
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl transition-colors duration-150"
                  aria-label="Close modal"
                >
                  <X size={28} />
                </button>
              </div>

              <input
                type="text"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter question text"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />

              {formData.answers.map((a, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={a}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              ))}

              <input
                type="number"
                value={formData.correct_answer}
                onChange={(e) =>
                  setFormData({ ...formData, correct_answer: +e.target.value })
                }
                placeholder="Correct answer index (0-based, e.g., 0 for first option)"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />

              <select
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: +e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: +e.target.value })
                }
                placeholder="Score for this question"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />

              <div className="space-y-2">
                <p className="text-gray-700 text-sm font-medium">
                  Eligibility Flags:
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    "weekly",
                    "monthly",
                    "mega",
                    "special_event",
                    "practice",
                  ].map((flag) => (
                    <label
                      key={flag}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={flag}
                        checked={formData.eligibility_flag.includes(flag)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            eligibility_flag: prev.eligibility_flag.includes(
                              value
                            )
                              ? prev.eligibility_flag.filter((f) => f !== value)
                              : [...prev.eligibility_flag, value],
                          }));
                        }}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {flag.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Question"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm space-y-6 transform transition-all duration-300 scale-100 opacity-100">
              <p className="text-gray-800 text-lg text-center">
                Are you sure you want to delete the question:{" "}
                <strong className="font-semibold text-red-600">
                  "{selectedQuestion.question}"
                </strong>
                ?
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  This action cannot be undone.
                </span>
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteQuestion}
                  className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionManagement;
