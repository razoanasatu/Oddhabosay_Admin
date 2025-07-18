"use client";
import { baseUrl } from "@/utils/constant";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

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

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // Map Excel rows to backend-compatible format
      const formattedQuestions = jsonData.map((row) => {
        // Prepare eligibility flag: remove "practice" if it's uploaded via Excel
        let eligibilityFlag = row.exam_type
          ? row.exam_type
              .split(",")
              .map((flag: string) => flag.trim())
              .filter(Boolean)
          : []; // Default to an empty array if there's no exam_type

        // Remove "practice" from eligibility flags if it exists
        const filteredEligibilityFlag = eligibilityFlag.filter(
          (flag: string) => flag !== "practice"
        );

        return {
          question: row.question,
          answers: [row.option1, row.option2, row.option3, row.option4].filter(
            Boolean
          ),
          correct_answer: Number(row.correct_answer),
          subjectId:
            subjects.find(
              (s) => s.name.toLowerCase() === row.subject?.toLowerCase()
            )?.id || -1,
          eligibility_flag: Array.from(new Set(filteredEligibilityFlag)), // Remove "practice" flag, retain others
          score: Number(row.score),
        };
      });

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${baseUrl}/api/question-bank/add-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: formattedQuestions }),
        });

        const json = await res.json();

        if (res.ok && json.success && Array.isArray(json.data)) {
          const uploadedQuestions: Question[] = json.data.map((q: any) => ({
            ...q,
            subjectId: q.subject?.id || -1,
            subject: q.subject || null,
          }));

          // Update question state
          setQuestions((prev) => [...prev, ...uploadedQuestions]);
          const newSelected = [...selectedQuestions, ...uploadedQuestions];
          setSelectedQuestions(newSelected);

          // Pass selected IDs and full data up
          onSelect(newSelected);

          alert("Questions uploaded successfully!");
        } else {
          setError(json.message || "Bulk upload failed.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload questions.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

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

          {/* Upload Button */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="excel-upload"
              className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition"
            >
              Upload from Excel
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
            {loading && (
              <span className="text-blue-600 text-sm">Uploading...</span>
            )}
          </div>
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
