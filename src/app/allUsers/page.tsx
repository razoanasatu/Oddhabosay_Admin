"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronsLeft, ChevronsRight, Eye, Search } from "lucide-react";
import React, { useState } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
}

const initialUsers: UserData[] = [
  {
    id: "1744668",
    name: "Rashidatul Kobra",
    email: "kobrarashi@gmail.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 123 456 7890",
  },
  {
    id: "1744650",
    name: "Soykot Hosen",
    email: "soykot@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 987 654 3210",
  },
  {
    id: "1744651",
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 111 222 3333",
  },
  {
    id: "1744652",
    name: "Tanvir Alam",
    email: "tanvir@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 444 555 6666",
  },
  {
    id: "1744653",
    name: "Sadia Haque",
    email: "sadia@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 777 888 9999",
  },
  {
    id: "1744654",
    name: "Hasib Rahman",
    email: "hasib@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 888 777 6666",
  },
  {
    id: "1744655",
    name: "Maliha Nigar",
    email: "maliha@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 333 222 1111",
  },
  {
    id: "1744656",
    name: "Rafiul Islam",
    email: "rafiul@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 222 111 0000",
  },
  {
    id: "1744657",
    name: "Anika Sultana",
    email: "anika@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 999 888 7777",
  },
  {
    id: "1744658",
    name: "Fahim Chowdhury",
    email: "fahim@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 666 555 4444",
  },
  {
    id: "1744659",
    name: "Zarin Tasnim",
    email: "zarin@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 555 444 3333",
  },
  {
    id: "1744660",
    name: "Noman Ali",
    email: "noman@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 444 333 2222",
  },
  {
    id: "1744661",
    name: "Tania Akter",
    email: "tania@example.com",
    address: "Los Angeles, CA 90001",
    mobileNumber: "+1 321 654 9870",
  },
];

export default function Dashboard() {
  const [users] = useState<UserData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((val) =>
      val.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedUsers = [...filteredUsers].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedUsers.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-black">User Dashboard</h1>

      {/* Search + Row Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center border rounded px-2 bg-white w-full sm:w-96">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <Input
            placeholder="Search user"
            value={searchQuery}
            onChange={handleSearch}
            className="flex-grow border-0 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <Select
          onValueChange={handleRowsPerPageChange}
          defaultValue={rowsPerPage.toString()}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input type="checkbox" className="rounded" />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentRows.length > 0 ? (
              currentRows.map((user, index) => (
                <TableRow key={`${user.id}-${index}`}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
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
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.mobileNumber}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-md border border-purple-500 text-purple-500 hover:bg-purple-100"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No users found.
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
