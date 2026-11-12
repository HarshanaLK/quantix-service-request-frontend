export type UserRole = "employee" | "manager" | "operations";
export type RequestStatus =
  | "draft"
  | "pending"
  | "returned"
  | "approved"
  | "rejected"
  | "assigned"
  | "in_progress"
  | "completed";
export type RequestCategory =
  "it_support" | "equipment" | "maintenance" | "access" | "other";
export type Priority = "low" | "medium" | "high";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  manager_id?: number | null;
  department?: string | null;
}
export interface Person {
  id: number;
  name: string;
  email?: string;
}
export interface RequestComment {
  id: number;
  body: string;
  user?: Person | null;
  created_at: string | null;
}
export interface RequestActivity {
  id: number;
  action: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus | null;
  comment?: string | null;
  details?: Record<string, { from: unknown; to: unknown }> | null;
  actor?: Person | null;
  created_at: string | null;
}
export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  category: RequestCategory;
  priority: Priority;
  status: RequestStatus;
  employee?: Person | null;
  assignee?: Person | null;
  comments?: RequestComment[];
  activities?: RequestActivity[];
  created_at: string | null;
  updated_at: string | null;
}
export interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PageMeta;
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
export type RequestInput = Pick<
  ServiceRequest,
  "title" | "description" | "category" | "priority"
>;
