"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { RequestForm } from "@/components/request-form";
import { Alert, EmptyState, Loading } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ServiceRequest } from "@/lib/types";

export default function EditRequestPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (!Number.isSafeInteger(id) || id < 1) { setError("Invalid request ID."); setLoading(false); return; }
    api.request(id).then(res => { if (active) setRequest(res.data); }).catch(err => { if (active) setError(err instanceof ApiError ? err.message : "Could not load request."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <Loading/>;
  if (error) return <Alert message={error}/>;
  if (!request || !user) return null;
  const canEdit = user.role === "employee" && request.employee?.id === user.id && ["draft", "returned"].includes(request.status);
  if (!canEdit) return <div className="panel"><EmptyState icon="lock" title="This request cannot be edited" description="Only the request owner may edit a draft or returned request." action={<Link href={`/requests/${id}`} className="btn-secondary">View request</Link>}/></div>;
  return <RequestForm request={request}/>;
}
