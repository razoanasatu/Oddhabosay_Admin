"use client";
import { baseUrl } from "@/utils/constant";
import { useEffect, useMemo, useState } from "react";

type Subject = {
  id: number;
  name: string;
  // Removed 'questions' from here as it's processed upon fetch
};

type Question = {
  id: number;
  question: string;
  answers: string[];
  correct_answer: number;
  subjectId: number; // This will be manually added during processing
  subject?: Subject; // This will be manually added during processing
  eligibility_flag: string[];
  score: number;
  createdAt: string; // Add createdAt as it's in your response
};

type SubjectApiResponse = {
  id: number;
  name: string;
  questions: Omit<Question, "subjectId" | "subject">[]; // Questions without subjectId/subject initially
};

type Props = {
  onSelect: (questions: Question[]) => void;
};

const QuestionSelector = ({ onSelect }: Props) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all data
  useEffect(() => {
    fetchSubjectsAndQuestions(); // Combined fetch
  }, []);

  const fetchSubjectsAndQuestions = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors

      const res = await fetch(`${baseUrl}/api/subjects`);
      const json = await res.json();

      if (json.success) {
        const fetchedSubjects: SubjectApiResponse[] = json.data;
        const allProcessedQuestions: Question[] = [];
        const uniqueSubjects: Subject[] = []; // To store subjects without nested questions

        fetchedSubjects.forEach((subjectData) => {
          // Store the subject itself (without its nested questions for the dropdown)
          uniqueSubjects.push({ id: subjectData.id, name: subjectData.name });

          // Process questions nested within each subject
          subjectData.questions.forEach((q) => {
            allProcessedQuestions.push({
              ...q,
              subjectId: subjectData.id, // Add the subjectId to each question
              subject: { id: subjectData.id, name: subjectData.name }, // Add the subject object
            });
          });
        });

        setSubjects(uniqueSubjects);
        setQuestions(allProcessedQuestions);
      } else {
        setError(json.message || "Failed to load subjects and questions.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load subjects and questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Memoize the filtered questions to optimize performance
  const filteredQuestions = useMemo(() => {
    if (selectedSubjectId === 0) {
      return questions;
    }
    return questions.filter((q) => q.subjectId === selectedSubjectId);
  }, [questions, selectedSubjectId]);

  const toggleSelect = (question: Question) => {
    setSelectedQuestions((prev) =>
      prev.some((q) => q.id === question.id)
        ? prev.filter((q) => q.id !== question.id)
        : [...prev, question]
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Select Questions</h1>

          <button
            onClick={() => onSelect(selectedQuestions)}
            disabled={selectedQuestions.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm Selection ({selectedQuestions.length})
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <label className="text-gray-700 font-medium">
            Filter by Subject:
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded-md bg-white text-gray-800"
          >
            <option value={0}>All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 p-4 rounded">
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Select
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Question
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Subject
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-blue-500">
                    Loading questions...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No questions found.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.some(
                          (sel) => sel.id === q.id
                        )}
                        onChange={() => toggleSelect(q)}
                      />
                    </td>
                    <td className="p-4 max-w-md truncate">{q.question}</td>
                    <td className="p-4">{q.subject?.name || "N/A"}</td>
                    <td className="p-4">{q.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector;
