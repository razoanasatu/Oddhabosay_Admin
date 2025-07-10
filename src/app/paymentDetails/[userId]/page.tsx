"use client";

import { Button } from "@/components/ui/button"; // Your shadcn button
import { baseUrl } from "@/utils/constant"; // Ensure this path is correct for your baseUrl
import { ArrowLeft, Download } from "lucide-react"; // Icons
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Your toast notification library

// PDF specific imports
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

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
    color: "#4a148c", // Purple
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
    color: "#6a1b9a", // Darker purple
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
        Loading payment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 min-h-screen flex flex-col items-center justify-center">
        <p>{error}</p>
        <Button
          onClick={() => router.back()}
          className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6 text-center text-gray-500 min-h-screen flex flex-col items-center justify-center">
        <p>No user details found.</p>
        <Button
          onClick={() => router.back()}
          className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-900">
          Payment Details for {userDetails.full_name}
        </h1>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4">
          User Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {userDetails.full_name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {userDetails.email}
          </p>
          <p>
            <span className="font-semibold">Phone No:</span>{" "}
            {userDetails.phone_no}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {userDetails.address || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Institution:</span>{" "}
            {userDetails.institution_name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Total Prize Money Received:</span>{" "}
            {userDetails.total_prize_money_received}
          </p>
          <p>
            <span className="font-semibold">Total Withdrawal:</span>{" "}
            {userDetails.total_withdrawal}
          </p>
          <p>
            <span className="font-semibold">Total Spent:</span>{" "}
            {userDetails.total_spent}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4">
          Payment Methods
        </h2>
        {userDetails.payment_methods &&
        userDetails.payment_methods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Method Type
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Card/Account Name
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Account/Card Number
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {userDetails.payment_methods.map((method) => (
                  <tr key={method.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{method.method_type}</td>
                    <td className="py-2 px-4 border-b">
                      {method.card_name || method.accountName || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {method.card_number || method.accountNumber || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(method.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">
            No payment methods found for this user.
          </p>
        )}
      </div>

      <div className="mt-8 text-center">
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
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  "Generating PDF..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" /> Download as PDF
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
