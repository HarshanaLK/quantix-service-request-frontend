"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FilePlus2,
  Headphones,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Alert, Loading, PageTitle } from "@/components/ui";
import { RequestTable } from "@/components/request-table";
import { api, ApiError } from "@/lib/api";
import { STATUSES, STATUS_LABELS } from "@/lib/config";
import type { RequestStatus, ServiceRequest } from "@/lib/types";

const statusBarColor: Record<RequestStatus, string> = {
  draft: "bg-slate-400",
  pending: "bg-amber-400",
  returned: "bg-orange-400",
  approved: "bg-sky-500",
  rejected: "bg-rose-400",
  assigned: "bg-violet-500",
  in_progress: "bg-indigo-500",
  completed: "bg-emerald-500",
};

type Overview = {
  counts: Record<RequestStatus, number>;
  total: number;
  recent: ServiceRequest[];
};
export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        // Exact counts from Laravel's pagination totals, not a count of just the first page.
        const [all, ...counts] = await Promise.all([
          api.requests({ per_page: 6, sort: "created_at", direction: "desc" }),
          ...STATUSES.map((status) => api.requests({ status, per_page: 1 })),
        ]);
        if (alive) {
          const countMap = Object.fromEntries(
            STATUSES.map((status, i) => [status, counts[i].meta.total]),
          ) as Record<RequestStatus, number>;
          setOverview({
            counts: countMap,
            total: all.meta.total,
            recent: all.data,
          });
        }
      } catch (err) {
        if (alive)
          setError(
            err instanceof ApiError ? err.message : "Unable to load dashboard.",
          );
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);
  const context =
    user?.role === "employee"
      ? "See where your requests stand and keep work moving."
      : user?.role === "manager"
        ? "Review your team's service requests and make decisions."
        : "Coordinate approved requests and keep operations on track.";
  const quickLinks =
    user?.role === "employee"
      ? [
          {
            label: "Create a new request",
            href: "/requests/new",
            detail: "Need help? Start here.",
            icon: FilePlus2,
          },
          {
            label: "Returned for changes",
            href: "/requests?status=returned",
            detail: "Update and resubmit.",
            icon: RotateCcw,
          },
        ]
      : user?.role === "manager"
        ? [
            {
              label: "Pending approvals",
              href: "/requests?status=pending",
              detail: "Review team submissions.",
              icon: ClipboardCheck,
            },
            {
              label: "Reviewed requests",
              href: "/requests?status=approved",
              detail: "Browse recent approvals.",
              icon: CheckCircle2,
            },
          ]
        : [
            {
              label: "Ready to assign",
              href: "/requests?status=approved",
              detail: "Assign to operations.",
              icon: ClipboardCheck,
            },
            {
              label: "In progress",
              href: "/requests?status=in_progress",
              detail: "Advance outstanding work.",
              icon: Clock3,
            },
          ];
  const cards = [
    {
      label: "Total requests",
      value: overview?.total,
      icon: ClipboardList,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      label: "Pending review",
      value: overview?.counts.pending,
      icon: Clock3,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "In progress",
      value: overview?.counts.in_progress,
      icon: TrendingUp,
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "Completed",
      value: overview?.counts.completed,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
  ];
  return (
    <>
      <PageTitle
        eyebrow="Your workspace"
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle={context}
        action={
          user?.role === "employee" ? (
            <Link href="/requests/new" className="btn-primary">
              <FilePlus2 className="h-4 w-4" /> New request
            </Link>
          ) : undefined
        }
      />
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3533B9] via-indigo-600 to-[#6366F1] px-7 py-7 text-white shadow-lg shadow-indigo-200/50 sm:px-9">
        <div className="absolute -right-16 -top-40 h-80 w-80 rounded-full border border-white/15" />
        <div className="absolute -right-8 -top-28 h-64 w-64 rounded-full border border-white/15" />
        <div className="relative flex max-w-2xl items-start gap-4">
          <div className="hidden rounded-xl bg-white/15 p-3 sm:block">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-200">
              Service request center
            </p>
            <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
              Everything your team needs, in one place.
            </h2>
            <p className="mt-2 text-sm leading-6 text-indigo-100">
              Submit issues, follow progress, collaborate through comments, and
              keep every step accountable.
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-6">
          <Alert message={error} />
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-semibold text-indigo-600"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="panel p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                {label}
              </span>
              <span className={`rounded-xl p-2.5 ${bg}`}>
                <Icon className={`h-5 w-5 ${text}`} />
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-ink">
              {overview ? value : "—"}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Within your permitted requests
            </div>
          </div>
        ))}
      </div>
      {!overview && !error ? (
        <Loading label="Loading request statistics..." />
      ) : (
        overview && (
          <>
            <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
              <section className="panel p-6">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="section-title">Request breakdown</h2>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                    Live API totals
                  </span>
                </div>
                <p className="mb-6 text-xs text-slate-500">
                  Status distribution across the requests you can access
                </p>
                <div className="space-y-4">
                  {STATUSES.map((status) => (
                    <div
                      key={status}
                      className="grid grid-cols-[108px_1fr_28px] items-center gap-3 sm:grid-cols-[130px_1fr_30px]"
                    >
                      <div className="text-xs font-semibold text-slate-600">
                        {STATUS_LABELS[status]}
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${statusBarColor[status]}`}
                          style={{
                            width: `${overview.total ? (overview.counts[status] / overview.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="text-right text-xs font-bold text-slate-700">
                        {overview.counts[status]}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="panel p-6">
                <h2 className="section-title">Quick actions</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Pick up where you left off
                </p>
                <div className="mt-6 space-y-3">
                  {quickLinks.map(({ label, href, detail, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                    >
                      <span className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">
                          {label}
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {detail}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                    </Link>
                  ))}
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                  Actions are available only when your role and a request's
                  current status allow them.
                </div>
              </section>
            </div>
            <section className="panel mt-7 overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-6">
                <div>
                  <h2 className="section-title">Recent requests</h2>
                  <p className="mt-1 text-xs text-muted">
                    Latest activity in your accessible request list
                  </p>
                </div>
                <Link
                  href="/requests"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <RequestTable items={overview.recent} />
            </section>
          </>
        )
      )}
    </>
  );
}
