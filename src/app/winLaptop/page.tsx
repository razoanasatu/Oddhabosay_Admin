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
import { ChevronsLeft, ChevronsRight, Filter } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  name: string;
  status: "Received" | "Pending";
}

const names = [
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

export default function WinALaptop() {
  const [users, setUsers] = useState<UserData[]>([]);
  const searchQuery = "";
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const generatedUsers: UserData[] = names.map((name, index) => ({
      id: (index + 1).toString(),
      name,
      status: (Math.random() < 0.5 ? "Received" : "Pending") as
        | "Received"
        | "Pending",
    }));
    setUsers(generatedUsers);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Win a Laptop</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial No.</TableHead>
              <TableHead>Participant Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.length > 0 ? (
              currentRows.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{indexOfFirstRow + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=random`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      className={`px-3 py-1 text-xs text-white ${
                        user.status === "Received"
                          ? "bg-purple-500 hover:bg-purple-600"
                          : "bg-pink-500 hover:bg-pink-600"
                      }`}
                    >
                      {user.status}
                    </button>
                  </TableCell>
                  <TableCell className="max-w-sm text-sm text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
                    <br />
                    Nam eleifend dui cursus dapibus faucibus.
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No participants found.
                </TableCell>
              </TableRow>
            )}
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
