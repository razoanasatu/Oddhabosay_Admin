"use client";
import { baseUrl } from "@/utils/constant";
import { Edit, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type User = {
  full_name: string;
  email: string;
  phone_no: string;
};

type Challenge = {
  id: number;
  challenge_type: string;
};

type Transaction = {
  id: number;
  transaction_type: string;
  amount: string;
  transaction_date: string;
  transaction_status: string;
  payment_method: string | null;
  proof_image_url: string | null;
  description: string;
  user: User;
  challenge?: Challenge; // 👈 Add this
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [status, setStatus] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [bulkType, setBulkType] = useState<"GlobalBoard" | "challenge">(
    "GlobalBoard"
  );
  const [bulkImage, setBulkImage] = useState<File | null>(null);
  const [bulkChallengeId, setBulkChallengeId] = useState<string>("");
  const [bulkChallengeOptions, setBulkChallengeOptions] = useState<
    { id: number; type: string }[]
  >([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkChallengeIds, setBulkChallengeIds] = useState<string[]>([]);
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/transaction-history`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      } else {
        toast.error(data.message || "Failed to fetch transactions.");
      }
    } catch (err) {
      toast.error("Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setStatus(transaction.transaction_status);
    setImage(null);
    setShowEditModal(true);
  };

  // Fetch challenge IDs for dropdown (example API, adjust as needed)
  useEffect(() => {
    if (bulkType === "challenge") {
      fetch(`${baseUrl}/api/transaction-history`)
        .then((res) => res.json())
        .then((response) => {
          const transactions = response.data; // ✅ correctly access array

          if (Array.isArray(transactions)) {
            const uniqueChallenges: { id: number; type: string }[] = [];
            const seen = new Set();

            transactions.forEach((tx) => {
              if (tx.challenge && !seen.has(tx.challenge.id)) {
                uniqueChallenges.push({
                  id: tx.challenge.id,
                  type: tx.challenge.challenge_type,
                });
                seen.add(tx.challenge.id);
              }
            });

            setBulkChallengeOptions(uniqueChallenges);
          } else {
            toast.error("Unexpected data format.");
          }
        })
        .catch(() => {
          toast.error("Failed to fetch challenge IDs.");
        });
    }
  }, [bulkType]);

  const handleBulkApprove = async () => {
    setBulkLoading(true);
    const formData = new FormData();
    if (bulkType === "challenge" && bulkChallengeIds.length > 0) {
      bulkChallengeIds.forEach((id) => formData.append("challengeIds[]", id));
    } else {
      formData.append("transaction_type", "Global Board");
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/transaction-history/admin/update-multiple`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      if (response.ok) {
        toast.success("Bulk approval successful.");
        fetchTransactions();
        setBulkImage(null);
        setBulkChallengeId("");
      } else {
        const data = await response.json();
        toast.error(data.message || "Bulk approval failed.");
      }
    } catch {
      toast.error("Error during bulk approval.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTransaction) return;
    const formData = new FormData();
    formData.append("transaction_status", status);
    if (image) formData.append("image", image);

    try {
      const response = await fetch(
        `${baseUrl}/api/transaction-history/admin/update/${selectedTransaction.id}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Transaction updated successfully.");
        fetchTransactions();
        setShowEditModal(false);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update transaction.");
      }
    } catch (err) {
      toast.error("Error updating transaction.");
    }
  };

  // ...existing code...
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-8">
          Transaction History
        </h1>

        {/* Bulk Approve Section */}
        <div className="mb-8 p-5 bg-indigo-50 rounded-xl shadow flex flex-col gap-6">
          <h2 className="text-xl font-bold text-indigo-800 mb-2">
            Bulk Approve Transactions
          </h2>
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="font-medium text-gray-700">Type:</label>
              <select
                value={bulkType}
                onChange={(e) => {
                  setBulkType(e.target.value as "GlobalBoard" | "challenge");
                  setBulkChallengeIds([]);
                }}
                className="px-3 py-2 border rounded-lg bg-white"
              >
                <option value="global">Global Board</option>
                <option value="challenge">Challenge</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-[240px]">
              <label className="font-medium text-gray-700">
                Challenge ID(s):
              </label>
              <select
                multiple
                value={bulkChallengeIds}
                onChange={(e) =>
                  setBulkChallengeIds(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                className={`px-3 py-2 border rounded-lg bg-white text-sm h-[110px] ${
                  bulkType === "GlobalBoard"
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : ""
                }`}
                disabled={bulkType === "GlobalBoard"}
              >
                {bulkChallengeOptions.length === 0 ? (
                  <option disabled>No challenges found</option>
                ) : (
                  bulkChallengeOptions.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.id} &mdash; {ch.type}
                    </option>
                  ))
                )}
              </select>
              <span className="text-xs text-gray-500">
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
              </span>
            </div>
            <div className="flex flex-col gap-2 min-w-[180px]">
              <label className="font-medium text-gray-700">Proof Image:</label>
              <input
                type="file"
                onChange={(e) => setBulkImage(e.target.files?.[0] || null)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleBulkApprove}
              disabled={
                bulkLoading ||
                (bulkType === "challenge" && bulkChallengeIds.length === 0)
              }
              className={`px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition ${
                bulkLoading ||
                (bulkType === "challenge" && bulkChallengeIds.length === 0)
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {bulkLoading ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg mb-6 flex items-center shadow-md animate-fade-in">
            <X className="h-5 w-5 mr-3" />
            <div>
              <p className="font-semibold">Error!</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">
                ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">
                User
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">
                Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">
                Amount
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-bold text-purple-800 uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-right text-xs font-bold text-purple-800 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm">{tx.id}</td>
                  <td className="px-4 py-3 text-sm">{tx.user.full_name}</td>
                  <td className="px-4 py-3 text-sm">{tx.transaction_type}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                    BDT {tx.amount}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(tx.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{tx.transaction_status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Edit Modal */}
        {showEditModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-purple-900 mb-6 border-b pb-3">
                Edit Transaction #{selectedTransaction.id}
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Image (optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
                >
                  Update Transaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  // ...existing code...
};

export default TransactionHistory;
