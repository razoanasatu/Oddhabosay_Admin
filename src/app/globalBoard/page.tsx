"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Filter,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const participantData = [
  "Rashidatul Kobra",
  "Soykot Hosen",
  "Nusrat Jahan",
  "Tanvir Alam",
  "Sadia Haque",
  "Hasib Rahman",
  "Maliha Nigar",
  "Rafiul Islam",
  "Anika Sultana",
  "Fahim Chowdhury",
  "Zarin Tasnim",
  "Noman Ali",
  "Tania Akter",
];

const prizeAmounts = [
  1000, 750, 500, 150, 140, 130, 120, 110, 100, 90, 80, 70, 60,
];

export default function Globalboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [completedMap, setCompletedMap] = useState<number[]>([]);

  useEffect(() => {
    // Generate consistent random data on client-side only
    setCompletedMap(participantData.map(() => Math.floor(Math.random() * 10)));
  }, []);

  const totalPages = Math.ceil(participantData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = participantData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-black text-xl font-bold">GlobalBoard</h1>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2">
          Monthly
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Participant Name</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Prize Money</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((name, index) => {
              const globalIndex = indexOfFirstRow + index;
              const position =
                globalIndex === 0
                  ? "1st Position"
                  : globalIndex === 1
                  ? "2nd Position"
                  : globalIndex === 2
                  ? "3rd Position"
                  : `${globalIndex + 1}`;
              const completed = completedMap[globalIndex] ?? 0;
              const prize = prizeAmounts[globalIndex];
              const bgColor =
                globalIndex === 0
                  ? "bg-purple-600 text-white"
                  : globalIndex === 1 || globalIndex === 2
                  ? "bg-purple-500 text-white"
                  : globalIndex % 2 === 0
                  ? "bg-gray-100"
                  : "bg-white";

              return (
                <TableRow key={name} className={bgColor}>
                  <TableCell>{position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          name
                        )}&background=random`}
                        alt={name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{name}</span>
                      {globalIndex < 3 && (
                        <Crown className="w-4 h-4 text-yellow-300 ml-1" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{completed}</TableCell>
                  <TableCell>
                    <HelpCircle className="w-5 h-5 text-gray-500 bg-gray-200 rounded-full p-1" />
                  </TableCell>
                  <TableCell>${prize}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="flex items-center gap-1"
        >
          <ChevronsLeft className="w-4 h-4" /> Prev
        </Button>

        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="outline"
          className="flex items-center gap-1"
        >
          Next <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
