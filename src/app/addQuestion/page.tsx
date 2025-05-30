"use client";
import { baseUrl } from "@/utils/constant";
import { useState } from "react";

export default function AddQuestion() {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [subjectId, setSubjectId] = useState(3);
  const [eligibilityFlag, setEligibilityFlag] = useState(["weekly"]);
  const [score, setScore] = useState(10);

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      question,
      answers,
      correct_answer: correctAnswer,
      subjectId,
      eligibility_flag: eligibilityFlag,
      score,
    };

    console.log("Submitting payload:", payload);

    try {
      const res = await fetch(`${baseUrl}/api/question-bank/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Question submitted successfully!");
      } else {
        alert("Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md pt-4 px-12 pb-4 space-y-4 w-full min-h-[calc(100vh-10rem)] border border-purple-200"
      >
        {/* Question Name */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Options */}
        {answers.map((answer, index) => (
          <div key={index} className="flex flex-col w-full md:w-1/2">
            <label className="text-sm font-medium text-gray-700">
              Option {index + 1}
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
        ))}

        {/* Correct Answer Index */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Correct Answer (Index starting from 0)
          </label>
          <input
            type="number"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Score */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">Score</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Subject ID */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Subject ID
          </label>
          <input
            type="number"
            value={subjectId}
            onChange={(e) => setSubjectId(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Eligibility Flag */}
        <div className="flex flex-col w-full md:w-1/2">
          <label className="text-sm font-medium text-gray-700">
            Eligibility Flag
          </label>
          <input
            type="text"
            value={eligibilityFlag.join(", ")}
            onChange={(e) =>
              setEligibilityFlag(
                e.target.value
                  .split(",")
                  .map((flag) => flag.trim())
                  .filter((flag) => flag.length > 0)
              )
            }
            placeholder="e.g., weekly, monthly"
            className="border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col w-full md:w-1/2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-sm px-8 py-2 transition self-start"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
