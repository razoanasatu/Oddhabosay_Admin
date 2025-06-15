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
  subject?: Subject;
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

  // 🔍 Search state
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/question-bank`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
      }
    } catch {
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
        if (!formData.subjectId) {
          setFormData((prev) => ({ ...prev, subjectId: json.data[0].id }));
        }
      }
    } catch {
      console.error("Error fetching subjects");
    }
  }, [formData.subjectId]);

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
        fetchQuestions();
        resetForm();
      } else {
        setError("Submission failed.");
      }
    } catch {
      setError("Submission error");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async () => {
    if (!selectedQuestion) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/question-bank/${selectedQuestion.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        fetchQuestions();
        setShowDeleteModal(false);
        setSelectedQuestion(null);
      }
    } catch {
      console.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answers: ["", "", "", ""],
      correct_answer: 0,
      subjectId: subjects[0]?.id ?? 0,
      eligibility_flag: ["weekly"],
      score: 10,
    });
    setSelectedQuestion(null);
    setError("");
  };

  // 🔍 Filter questions by subject name
  const filteredQuestions = questions.filter((q) =>
    q.subject?.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Question Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={18} /> Add Question
        </button>
      </div>

      {/* 🔍 Search bar right aligned with icon */}
      <div className="flex justify-end mb-6">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search by subject (e.g., Math)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full border px-4 py-2 pl-10 rounded-full"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-100 border px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 text-sm font-semibold">Question</th>
              <th className="text-left p-3 text-sm font-semibold">Subject</th>
              <th className="text-left p-3 text-sm font-semibold">Score</th>
              <th className="text-right p-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-red-500">
                  No subject found.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{q.question}</td>
                  <td className="p-3">{q.subject?.name}</td>
                  <td className="p-3">{q.score}</td>
                  <td className="p-3 text-right">
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
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuestion(q);
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

      {/* Modal and Delete Components remain unchanged — keep them as is */}
      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/20 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold">
                {showEditModal ? "Edit Question" : "Create Question"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Enter question"
              className="w-full border px-3 py-2 rounded"
            />

            {formData.answers.map((a, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                value={a}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            ))}

            <input
              type="number"
              value={formData.correct_answer}
              onChange={(e) =>
                setFormData({ ...formData, correct_answer: +e.target.value })
              }
              placeholder="Correct answer index (0-based)"
              className="w-full border px-3 py-2 rounded"
            />

            <select
              value={formData.subjectId}
              onChange={(e) =>
                setFormData({ ...formData, subjectId: +e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
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
              placeholder="Score"
              className="w-full border px-3 py-2 rounded"
            />

            <div className="space-y-1">
              {["weekly", "monthly", "mega", "special_event", "practice"].map(
                (flag) => (
                  <label key={flag} className="inline-flex items-center gap-2">
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
                    />
                    <span className="text-sm">{flag}</span>
                  </label>
                )
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
            <p>
              Are you sure you want to delete the question:{" "}
              <strong>{selectedQuestion.question}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteQuestion}
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

export default QuestionManagement;
