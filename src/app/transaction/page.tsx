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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 mb-8">
          Transaction History
        </h1>

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
                    ${tx.amount}
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
};

export default TransactionHistory;
