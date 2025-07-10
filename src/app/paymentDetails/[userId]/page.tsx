"use client";

import { Button } from "@/components/ui/button"; // Your shadcn button
import { baseUrl } from "@/utils/constant"; // Ensure this path is correct for your baseUrl
import { ArrowLeft, Download } from "lucide-react"; // Icons
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Your toast notification library

// PDF specific imports
import dynamic from "next/dynamic"; // Import dynamic from next/dynamic

// Dynamically import PDFDownloadLink, ensuring it's only loaded on the client-side
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false, // This is crucial: prevents server-side rendering of this component
  }
);

// Keep other @react-pdf/renderer components imported directly,
// as they are used within the PDF document structure which is handled
// by the client-side-only PDFDownloadLink.
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// --- INTERFACES (Copy from Step 1, or ensure they are imported if in a shared file) ---
interface PaymentMethod {
  id: number;
  method_type: string;
  card_name: string | null;
  card_number: string | null;
  exp_month: string | null;
  exp_year: string | null;
  cvc: string | null;
  branchName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  routingNumber: string | null;
  swiftCode: string | null;
  accountOwnerPhoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserDetails {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  address: string | null;
  institution_name?: string | null;
  total_prize_money_received: string;
  total_withdrawal: string;
  total_spent: string;
  payment_methods: PaymentMethod[];
  // Add any other user details you might want to display/download
}
// --- END INTERFACES ---

// --- PDF Stylesheet (for @react-pdf/renderer) ---
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#4A0E4B", // Darker purple from dashboard
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
    color: "#6A1B9A", // Darker purple
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  // Table styles using flexbox (fixes 'display: "table"' error)
  table: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%", // Adjust column widths as needed
    backgroundColor: "#e0e0e0",
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableCol: {
    width: "25%", // Adjust column widths as needed
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
  },
});
// --- END PDF Stylesheet ---

// --- PDF Document Component ---
const PaymentDetailsPdf = ({ user }: { user: UserDetails }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Payment Details for {user.full_name}</Text>

      <View style={styles.section}>
        <Text style={styles.subHeader}>User Information</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Name:</Text> {user.full_name}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Email:</Text> {user.email}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Phone No:</Text> {user.phone_no}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Address:</Text> {user.address || "N/A"}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Institution:</Text>{" "}
          {user.institution_name || "N/A"}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Total Prize Money Received:</Text>{" "}
          {user.total_prize_money_received}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Total Withdrawal:</Text>{" "}
          {user.total_withdrawal}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Total Spent:</Text> {user.total_spent}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Payment Methods</Text>
        {user.payment_methods.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.bold}>Method Type</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.bold}>Card/Account Name</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.bold}>Account/Card Number</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.bold}>Created At</Text>
              </View>
            </View>
            {user.payment_methods.map((method) => (
              <View style={styles.tableRow} key={method.id}>
                <View style={styles.tableCol}>
                  <Text>{method.method_type}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{method.card_name || method.accountName || "N/A"}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>
                    {method.card_number || method.accountNumber || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{new Date(method.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.text}>
            No payment methods found for this user.
          </Text>
        )}
      </View>
    </Page>
  </Document>
);
// --- END PDF Document Component ---

// --- Main Page Component ---
export default function UserPaymentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string; // Get userId from URL

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/api/users`, {
          headers: {
            Accept: "application/json",
          },
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error("Invalid response from server.");
        }

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const user = json.data.find((u: any) => u.id === parseInt(userId));
          if (user) {
            setUserDetails(user);
          } else {
            throw new Error("User not found.");
          }
        } else {
          throw new Error(json.message || "Failed to load users.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          toast.error("❌ " + err.message);
        } else {
          setError("An unexpected error occurred.");
          toast.error("❌ An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-lg text-purple-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-6 w-6 mr-3 text-purple-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading payment details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold mb-4">Error: {error}</p>
        <Button
          onClick={() => router.back()}
          className="mt-4 bg-purple-700 text-white hover:bg-purple-800 px-6 py-3 rounded-md shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6 text-center text-gray-700 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold mb-4">No user details found.</p>
        <Button
          onClick={() => router.back()}
          className="mt-4 bg-purple-700 text-white hover:bg-purple-800 px-6 py-3 rounded-md shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b-2 border-purple-200">
        <h1 className="text-4xl font-bold mb-4 sm:mb-0 text-purple-900">
          Payment Details for{" "}
          <span className="text-purple-700">{userDetails.full_name}</span>
        </h1>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 bg-purple-700 text-white hover:bg-purple-800 px-6 py-3 rounded-md shadow-md transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 border-b pb-3">
          User Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800 text-base">
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">Name:</span>{" "}
            {userDetails.full_name}
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">Email:</span>{" "}
            {userDetails.email}
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">Phone No:</span>{" "}
            {userDetails.phone_no}
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">Address:</span>{" "}
            {userDetails.address || "N/A"}
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">Institution:</span>{" "}
            {userDetails.institution_name || "N/A"}
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">
              Total Prize Money Received:
            </span>{" "}
            <span className="text-green-600 font-bold">
              ${userDetails.total_prize_money_received}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">
              Total Withdrawal:
            </span>{" "}
            <span className="text-red-600 font-bold">
              ${userDetails.total_withdrawal}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="font-semibold text-purple-700">Total Spent:</span>{" "}
            <span className="text-blue-600 font-bold">
              ${userDetails.total_spent}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 border-b pb-3">
          Payment Methods
        </h2>
        {userDetails.payment_methods &&
        userDetails.payment_methods.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-purple-50">
                <tr>
                  <th className="py-3 px-5 border-b text-left text-purple-900 font-bold text-sm uppercase tracking-wider">
                    Method Type
                  </th>
                  <th className="py-3 px-5 border-b text-left text-purple-900 font-bold text-sm uppercase tracking-wider">
                    Card/Account Name
                  </th>
                  <th className="py-3 px-5 border-b text-left text-purple-900 font-bold text-sm uppercase tracking-wider">
                    Account/Card Number
                  </th>
                  <th className="py-3 px-5 border-b text-left text-purple-900 font-bold text-sm uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {userDetails.payment_methods.map((method) => (
                  <tr
                    key={method.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-purple-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-5 text-gray-800">
                      {method.method_type}
                    </td>
                    <td className="py-3 px-5 text-gray-800">
                      {method.card_name || method.accountName || "N/A"}
                    </td>
                    <td className="py-3 px-5 text-gray-800">
                      {method.card_number || method.accountNumber || "N/A"}
                    </td>
                    <td className="py-3 px-5 text-gray-800">
                      {new Date(method.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 italic py-4 text-center">
            No payment methods found for this user.
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        {userDetails && (
          <PDFDownloadLink
            document={<PaymentDetailsPdf user={userDetails} />}
            fileName={`payment_details_${userDetails.full_name.replace(
              /\s+/g,
              "_"
            )}.pdf`}
          >
            {({ loading }) => (
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 rounded-lg shadow-lg transition-all duration-200 text-lg flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download className="w-5 h-5" /> Download as PDF
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>
    </div>
  );
}
