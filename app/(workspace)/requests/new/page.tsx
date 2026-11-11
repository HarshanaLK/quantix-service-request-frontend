"use client";

import Link from "next/link";
import { RequestForm } from "@/components/request-form";
import { useAuth } from "@/components/auth-provider";
import { EmptyState } from "@/components/ui";

export default function NewRequestPage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== "employee") return <div className="panel"><EmptyState icon="lock" title="Employee access required" description="Only employees can create service requests in this Laravel backend." action={<Link href="/requests" className="btn-secondary">Back to requests</Link>}/></div>;
  return <RequestForm/>;
}
