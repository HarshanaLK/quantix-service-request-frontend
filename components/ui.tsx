import { AlertCircle, Inbox, LoaderCircle, ShieldAlert } from "lucide-react";
import type { Priority, RequestStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/config";
import { clsx } from "clsx";

const statusColor: Record<RequestStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  returned: "bg-orange-50 text-orange-700 ring-orange-200",
  approved: "bg-sky-50 text-sky-700 ring-sky-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  assigned: "bg-violet-50 text-violet-700 ring-violet-200",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusColor[status],
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
const priorityColor: Record<Priority, string> = {
  low: "text-slate-500",
  medium: "text-amber-600",
  high: "text-red-600",
};
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-bold capitalize",
        priorityColor[priority],
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          priority === "high"
            ? "bg-red-500"
            : priority === "medium"
              ? "bg-amber-400"
              : "bg-slate-400",
        )}
      />
      {priority}
    </span>
  );
}
export function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[.17em] text-indigo-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      )}
    </div>
  );
}
export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-slate-500">
      <LoaderCircle className="h-7 w-7 animate-spin text-indigo-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
export function Alert({
  message,
  kind = "error",
}: {
  message: string;
  kind?: "error" | "success" | "info";
}) {
  const color =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : kind === "info"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-red-200 bg-red-50 text-red-800";
  return (
    <div
      role="alert"
      className={clsx(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-6",
        color,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
export function EmptyState({
  title = "Nothing to show",
  description,
  icon = "empty",
  action,
}: {
  title?: string;
  description?: string;
  icon?: "empty" | "lock";
  action?: React.ReactNode;
}) {
  const Icon = icon === "lock" ? ShieldAlert : Inbox;
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="rounded-2xl bg-slate-100 p-4">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="font-bold text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1.5 text-xs text-red-600">{message}</p>
  ) : null;
}
