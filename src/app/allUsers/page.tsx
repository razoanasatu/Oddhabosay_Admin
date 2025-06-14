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
import { baseUrl } from "@/utils/constant";
import { ChevronsLeft, ChevronsRight, Eye, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ApiUser {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  address: string;
  image: string | null;
}

export default function Dashboard() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/users`, {
          headers: {
            Accept: "application/json",
          },
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error("Invalid response from server");
        }

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setUsers(json.data);
        } else {
          throw new Error(json.message || "Failed to load users");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    [user.full_name, user.email, user.phone_no, user.address]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) =>
    a.id.toString().localeCompare(b.id.toString())
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

      {/* Search and Row Count */}
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
              <TableHead>Phone</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : currentRows.length > 0 ? (
              currentRows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          user.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.full_name
                          )}&background=random`
                        }
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.phone_no}</TableCell>
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
