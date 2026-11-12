import type {
  RequestCategory,
  RequestStatus,
  Priority,
  UserRole,
} from "./types";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  returned: "Returned",
  approved: "Approved",
  rejected: "Rejected",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
};
export const STATUSES = Object.keys(STATUS_LABELS) as RequestStatus[];
export const CATEGORY_LABELS: Record<RequestCategory, string> = {
  it_support: "IT support",
  equipment: "Equipment",
  maintenance: "Maintenance",
  access: "Access request",
  other: "Other",
};
export const CATEGORIES = Object.keys(CATEGORY_LABELS) as RequestCategory[];
export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const ROLE_LABELS: Record<UserRole, string> = {
  employee: "Employee",
  manager: "Manager",
  operations: "Operations",
};
export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
export function displayAction(action: string) {
  return (
    (
      {
        created: "created request",
        updated: "updated request",
        submitted: "submitted request",
        submit: "submitted request",
        approve: "approved request",
        reject: "rejected request",
        return: "returned request",
        assign: "assigned request",
        start: "started work",
        complete: "completed request",
        commented: "added a comment",
      } as Record<string, string>
    )[action] || action.replaceAll("_", " ")
  );
}
