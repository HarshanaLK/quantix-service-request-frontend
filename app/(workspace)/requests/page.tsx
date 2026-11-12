"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { RequestTable } from "@/components/request-table";
import { Alert, Loading, PageTitle } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { STATUSES, STATUS_LABELS } from "@/lib/config";
import type { PaginatedResponse, ServiceRequest } from "@/lib/types";

function RequestList() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("search") || "");
  const [result, setResult] =
    useState<PaginatedResponse<ServiceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = searchParams.toString();
  useEffect(() => {
    setText(searchParams.get("search") || "");
  }, [searchParams]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    const params = Object.fromEntries(new URLSearchParams(query).entries());
    api
      .requests(params)
      .then((res) => {
        if (alive) setResult(res);
      })
      .catch((err) => {
        if (alive)
          setError(
            err instanceof ApiError ? err.message : "Could not load requests.",
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [query]);
  function updateQuery(changes: Record<string, string>) {
    const next = new URLSearchParams(query);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    if (!("page" in changes)) next.delete("page");
    router.push(`/requests${next.size ? `?${next.toString()}` : ""}`);
  }
  function submitSearch(e: FormEvent) {
    e.preventDefault();
    updateQuery({ search: text.trim() });
  }
  return (
    <>
      <PageTitle
        eyebrow="Service desk"
        title="Service requests"
        subtitle={
          user?.role === "employee"
            ? "Manage requests you've created and follow their progress."
            : user?.role === "manager"
              ? "Browse requests submitted by your direct reports."
              : "Manage and track requests across the organization."
        }
        action={
          user?.role === "employee" ? (
            <Link href="/requests/new" className="btn-primary">
              <FilePlus2 className="h-4 w-4" /> New request
            </Link>
          ) : undefined
        }
      />
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-ink">Filter requests</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(150px,1fr)_minmax(150px,.8fr)_minmax(130px,.7fr)]">
            <form onSubmit={submitSearch} className="flex min-w-0 gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="field !pl-9"
                  placeholder="Search title or description"
                  aria-label="Search requests"
                />
              </div>
              <button className="btn-secondary !px-3" type="submit">
                Search
              </button>
            </form>
            <select
              aria-label="Filter by status"
              value={searchParams.get("status") || ""}
              className="field"
              onChange={(e) => updateQuery({ status: e.target.value })}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort requests"
              value={searchParams.get("sort") || "created_at"}
              className="field"
              onChange={(e) => updateQuery({ sort: e.target.value })}
            >
              <option value="created_at">Created date</option>
              <option value="updated_at">Updated date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>
            <select
              aria-label="Sort direction"
              value={searchParams.get("direction") || "desc"}
              className="field"
              onChange={(e) => updateQuery({ direction: e.target.value })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Filters are applied on the Laravel API.
            </p>
            <button
              onClick={() => {
                setText("");
                router.push("/requests");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset filters
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-bold text-ink">
            Results{" "}
            <span className="ml-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
              {result?.meta.total ?? "—"}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows</span>
            <select
              aria-label="Rows per page"
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
              value={searchParams.get("per_page") || "10"}
              onChange={(e) => updateQuery({ per_page: e.target.value })}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <div className="p-5">
            <Alert message={error} />
          </div>
        )}
        {loading ? (
          <Loading label="Loading requests..." />
        ) : (
          !error && <RequestTable items={result?.data || []} />
        )}
        {result && !error && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6">
            <span>
              Showing {result.meta.from ?? 0}–{result.meta.to ?? 0} of{" "}
              {result.meta.total} requests
            </span>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary !px-3 !py-2"
                disabled={result.meta.current_page <= 1}
                onClick={() =>
                  updateQuery({ page: String(result.meta.current_page - 1) })
                }
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="px-2 font-semibold">
                {result.meta.current_page} / {result.meta.last_page || 1}
              </span>
              <button
                className="btn-secondary !px-3 !py-2"
                disabled={result.meta.current_page >= result.meta.last_page}
                onClick={() =>
                  updateQuery({ page: String(result.meta.current_page + 1) })
                }
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
export default function RequestsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RequestList />
    </Suspense>
  );
}
