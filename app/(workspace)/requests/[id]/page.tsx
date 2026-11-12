"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  FileText,
  ListChecks,
  MessageSquare,
  RefreshCw,
  Send,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  Alert,
  EmptyState,
  FieldError,
  Loading,
  PageTitle,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import {
  CATEGORY_LABELS,
  displayAction,
  formatDate,
  initials,
  STATUS_LABELS,
} from "@/lib/config";
import type {
  PaginatedResponse,
  RequestActivity,
  ServiceRequest,
} from "@/lib/types";

const DONE = ["completed", "rejected"];

function InfoCell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </dt>
      <dd className="text-sm font-semibold text-slate-700">{children}</dd>
    </div>
  );
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [activities, setActivities] =
    useState<PaginatedResponse<RequestActivity> | null>(null);
  const [activityPage, setActivityPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [decision, setDecision] = useState<"approve" | "reject" | "return">(
    "approve",
  );
  const [decisionComment, setDecisionComment] = useState("");
  const [assignId, setAssignId] = useState("");
  const [assignComment, setAssignComment] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [comment, setComment] = useState("");

  const load = useCallback(
    async (showLoader: boolean) => {
      if (!Number.isSafeInteger(id) || id < 1) {
        setError("Invalid request ID.");
        setLoading(false);
        return;
      }
      if (showLoader) setLoading(true);
      try {
        const [item, log] = await Promise.all([
          api.request(id),
          api.activity(id, activityPage),
        ]);
        setRequest(item.data);
        setActivities(log);
        setError("");
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load request details.",
        );
      } finally {
        setLoading(false);
      }
    },
    [id, activityPage],
  );
  useEffect(() => {
    void load(true);
  }, [load]);

  async function mutation(
    action: () => Promise<{ message?: string }>,
  ): Promise<boolean> {
    setBusy(true);
    setActionError("");
    setFieldErrors({});
    setSuccess("");
    try {
      const response = await action();
      setSuccess(response.message || "Action completed.");
      await load(false);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
        setFieldErrors(err.errors);
      } else setActionError("The action could not be completed.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function onDecision(e: FormEvent) {
    e.preventDefault();
    if (
      await mutation(() => api.decision(id, decision, decisionComment.trim()))
    )
      setDecisionComment("");
  }
  async function onAssign(e: FormEvent) {
    e.preventDefault();
    const target = Number(assignId);
    if (!Number.isSafeInteger(target) || target < 1) {
      setActionError("Enter a valid operations user ID.");
      return;
    }
    if (
      await mutation(() =>
        api.assign(id, target, assignComment.trim() || undefined),
      )
    ) {
      setAssignComment("");
      setAssignId("");
    }
  }
  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 2) {
      setActionError("Comment must contain at least two characters.");
      return;
    }
    // Do not clear entered text if the backend rejects the comment.
    setBusy(true);
    setActionError("");
    setFieldErrors({});
    setSuccess("");
    try {
      const response = await api.comment(id, comment.trim());
      setComment("");
      setSuccess(response.message || "Comment added.");
      await load(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
        setFieldErrors(err.errors);
      } else setActionError("Unable to add comment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !request) return <Loading label="Loading request..." />;
  if (error && !request)
    return (
      <div className="panel p-6">
        <Alert message={error} />
        <Link href="/requests" className="btn-secondary mt-5">
          Back to requests
        </Link>
      </div>
    );
  if (!request || !user) return null;

  const editable =
    user.role === "employee" &&
    request.employee?.id === user.id &&
    (request.status === "draft" || request.status === "returned");
  const canDecide = user.role === "manager" && request.status === "pending";
  const canAssign = user.role === "operations" && request.status === "approved";
  const canStart = user.role === "operations" && request.status === "assigned";
  const canComplete =
    user.role === "operations" && request.status === "in_progress";
  const canComment = !DONE.includes(request.status);
  const statusNext = canStart ? "in_progress" : "completed";
  return (
    <>
      <Link
        href="/requests"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>
      <PageTitle
        eyebrow={`Service request #${request.id}`}
        title={request.title}
        subtitle={`Created ${formatDate(request.created_at)} · Last updated ${formatDate(request.updated_at)}`}
        action={
          <>
            <button
              type="button"
              aria-label="Refresh request"
              title="Refresh"
              onClick={() => void load(true)}
              className="btn-secondary !px-3"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {editable && (
              <Link
                href={`/requests/${request.id}/edit`}
                className="btn-secondary"
              >
                <Edit3 className="h-4 w-4" /> Edit request
              </Link>
            )}
            {editable && (
              <button
                disabled={busy}
                onClick={() => void mutation(() => api.submit(id))}
                className="btn-primary"
              >
                <Send className="h-4 w-4" /> Submit for review
              </button>
            )}
          </>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <StatusBadge status={request.status} />
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {CATEGORY_LABELS[request.category]}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1">
          <PriorityBadge priority={request.priority} />
        </span>
      </div>
      {error && (
        <div className="mb-4">
          <Alert message={error} />
        </div>
      )}
      {actionError && (
        <div className="mb-4 space-y-2">
          <Alert message={actionError} />
          {Object.entries(fieldErrors).map(([field, messages]) => (
            <p key={field} className="text-xs text-red-600">
              <strong>{field}:</strong> {messages.join(" ")}
            </p>
          ))}
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert kind="success" message={success} />
        </div>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(310px,1fr)]">
        <div className="space-y-6">
          <section className="panel p-6 sm:p-7">
            <h2 className="section-title mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" /> Request overview
            </h2>
            <dl className="grid gap-6 border-b border-slate-100 pb-7 sm:grid-cols-2">
              <InfoCell title="Request ID">#{request.id}</InfoCell>
              <InfoCell title="Status">
                {STATUS_LABELS[request.status]}
              </InfoCell>
              <InfoCell title="Category">
                {CATEGORY_LABELS[request.category]}
              </InfoCell>
              <InfoCell title="Priority">
                <PriorityBadge priority={request.priority} />
              </InfoCell>
              <InfoCell title="Requested by">
                {request.employee?.name || "Unknown employee"}
              </InfoCell>
              <InfoCell title="Assigned to">
                {request.assignee?.name || "Not assigned yet"}
              </InfoCell>
            </dl>
            <div className="pt-6">
              <h3 className="mb-3 text-sm font-bold text-slate-700">
                Description
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                {request.description}
              </p>
            </div>
          </section>
          {(editable || canDecide || canAssign || canStart || canComplete) && (
            <section className="panel p-6 sm:p-7">
              <h2 className="section-title mb-1 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-indigo-600" /> Next action
              </h2>
              <p className="mb-6 text-xs text-muted">
                Only actions valid for your role and the current status appear
                here.
              </p>
              {editable && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-sm font-bold text-indigo-900">
                    Ready for manager review?
                  </p>
                  <p className="mt-1 text-xs leading-6 text-indigo-700">
                    Check that all details are correct, then submit your
                    request.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() => void mutation(() => api.submit(id))}
                    className="btn-primary mt-4"
                  >
                    <Send className="h-4 w-4" /> Submit request
                  </button>
                </div>
              )}
              {canDecide && (
                <form onSubmit={onDecision} className="space-y-4">
                  <div>
                    <label className="field-label" htmlFor="decision">
                      Manager decision
                    </label>
                    <select
                      className="field"
                      id="decision"
                      value={decision}
                      onChange={(e) =>
                        setDecision(e.target.value as typeof decision)
                      }
                    >
                      <option value="approve">Approve</option>
                      <option value="return">Return for changes</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="decision-comment">
                      Decision comment *
                    </label>
                    <textarea
                      id="decision-comment"
                      className="field"
                      required
                      minLength={3}
                      maxLength={2000}
                      rows={3}
                      placeholder="Explain your decision..."
                      value={decisionComment}
                      onChange={(e) => setDecisionComment(e.target.value)}
                    />
                    <FieldError message={fieldErrors.comment?.[0]} />
                  </div>
                  <button type="submit" disabled={busy} className="btn-primary">
                    <ClipboardCheck className="h-4 w-4" /> Record decision
                  </button>
                </form>
              )}
              {canAssign && (
                <form onSubmit={onAssign} className="space-y-4">
                  <div>
                    <label className="field-label" htmlFor="assignee-id">
                      Operations user ID *
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="assignee-id"
                        className="field"
                        type="number"
                        min={1}
                        step={1}
                        required
                        placeholder="Enter operations user ID"
                        value={assignId}
                        onChange={(e) => setAssignId(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setAssignId(String(user.id))}
                        className="btn-secondary shrink-0"
                      >
                        <UserRoundCheck className="h-4 w-4" /> Assign to me
                      </button>
                    </div>
                    <FieldError message={fieldErrors.assigned_to?.[0]} />
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      This backend has no users-list endpoint. You can assign to
                      yourself or enter the ID of another operations user. The
                      Laravel API validates the role.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="assignment-note" className="field-label">
                      Assignment note (optional)
                    </label>
                    <textarea
                      id="assignment-note"
                      className="field"
                      maxLength={2000}
                      rows={2}
                      value={assignComment}
                      onChange={(e) => setAssignComment(e.target.value)}
                      placeholder="Additional instructions..."
                    />
                  </div>
                  <button disabled={busy} type="submit" className="btn-primary">
                    <UserRoundCheck className="h-4 w-4" /> Assign request
                  </button>
                </form>
              )}
              {(canStart || canComplete) && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    {canStart
                      ? "Move this request into active work."
                      : "Mark this request as resolved and complete."}
                  </p>
                  <div>
                    <label className="field-label" htmlFor="status-note">
                      Status update note (optional)
                    </label>
                    <textarea
                      id="status-note"
                      className="field"
                      maxLength={2000}
                      rows={3}
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      placeholder="Describe the progress or resolution..."
                    />
                  </div>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void mutation(() =>
                        api.status(
                          id,
                          statusNext as "in_progress" | "completed",
                          statusComment.trim() || undefined,
                        ),
                      )
                    }
                    className="btn-primary"
                  >
                    <Check className="h-4 w-4" />
                    {canStart ? "Start work" : "Mark completed"}
                  </button>
                </div>
              )}
            </section>
          )}
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-100 p-6">
              <h2 className="section-title flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" /> Comments{" "}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {request.comments?.length || 0}
                </span>
              </h2>
              <p className="mt-1 text-xs text-muted">
                Collaborate with the people involved in this request
              </p>
            </div>
            <div className="space-y-5 p-6">
              {request.comments?.length ? (
                request.comments.map((item) => (
                  <article key={item.id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {initials(item.user?.name || "User")}
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {item.user?.name || "Unknown user"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {item.body}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="py-3 text-center text-sm text-slate-400">
                  No comments yet.
                </p>
              )}
              {canComment ? (
                <form
                  onSubmit={onComment}
                  className="border-t border-slate-100 pt-5"
                >
                  <label className="field-label" htmlFor="new-comment">
                    Add a comment
                  </label>
                  <textarea
                    id="new-comment"
                    className="field"
                    rows={3}
                    required
                    minLength={2}
                    maxLength={2000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write an update or a question..."
                  />
                  <FieldError message={fieldErrors.body?.[0]} />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {comment.length}/2000
                    </span>
                    <button
                      disabled={busy}
                      type="submit"
                      className="btn-primary"
                    >
                      <Send className="h-4 w-4" /> Post comment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-500">
                  Comments are closed for rejected and completed requests.
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="panel p-6">
            <h2 className="section-title mb-5 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-indigo-600" /> People
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {initials(request.employee?.name || "Employee")}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">
                    {request.employee?.name || "Employee"}
                  </p>
                  <p className="text-xs text-muted">Requested by</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {initials(request.assignee?.name || "?")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {request.assignee?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-muted">Operations assignee</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="section-title flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" /> Activity
                  history
                </h2>
                <span className="text-xs text-slate-400">
                  {activities?.meta.total ?? 0} events
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Full, paginated audit trail
              </p>
            </div>
            {!activities ? (
              <Loading label="Loading history..." />
            ) : activities.data.length ? (
              <div className="px-6 pt-5">
                <div className="space-y-0">
                  {activities.data.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                          <Activity className="h-3.5 w-3.5 text-indigo-600" />
                        </span>
                        {i < activities.data.length - 1 && (
                          <span className="min-h-8 w-px flex-1 bg-slate-200" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-6">
                        <p className="text-sm font-bold text-slate-800">
                          <span className="text-indigo-600">
                            {event.actor?.name || "System"}
                          </span>{" "}
                          {displayAction(event.action)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          <CalendarDays className="mr-1 inline h-3 w-3" />
                          {formatDate(event.created_at)}
                        </p>
                        {event.from_status &&
                          event.to_status &&
                          event.from_status !== event.to_status && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5">
                                {STATUS_LABELS[event.from_status]}
                              </span>
                              <span>→</span>
                              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                                {STATUS_LABELS[event.to_status]}
                              </span>
                            </div>
                          )}
                        {event.comment && (
                          <p className="mt-2 break-words rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600">
                            {event.comment}
                          </p>
                        )}
                        {event.details &&
                          Object.keys(event.details).length > 0 && (
                            <div className="mt-2 space-y-1">
                              {Object.entries(event.details).map(
                                ([field, change]) => (
                                  <p
                                    key={field}
                                    className="break-words text-xs text-slate-500"
                                  >
                                    <span className="font-semibold capitalize">
                                      {field.replaceAll("_", " ")}:
                                    </span>{" "}
                                    {String(change.from ?? "—")} →{" "}
                                    {String(change.to ?? "—")}
                                  </p>
                                ),
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No audit events"
                description="Events will appear here as the request progresses."
              />
            )}
            {activities && activities.meta.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
                <button
                  disabled={activityPage <= 1}
                  className="btn-secondary !px-2 !py-2"
                  onClick={() => setActivityPage((x) => x - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span>
                  Page {activities.meta.current_page} /{" "}
                  {activities.meta.last_page}
                </span>
                <button
                  disabled={activityPage >= activities.meta.last_page}
                  className="btn-secondary !px-2 !py-2"
                  onClick={() => setActivityPage((x) => x + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
