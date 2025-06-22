// app/ClientLayoutWrapper.tsx
"use client";

import AdminLayout from "../../components/AdminLayout";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
