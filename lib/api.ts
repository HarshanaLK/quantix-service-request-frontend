import type {
  ApiResponse,
  PaginatedResponse,
  RequestActivity,
  RequestInput,
  ServiceRequest,
  User,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function jsonRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const json: unknown = await response.json().catch(() => null);
  const obj = (json && typeof json === "object" ? json : {}) as {
    message?: string;
    errors?: Record<string, string[]>;
  };
  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !path.includes("/session/")
    ) {
      window.location.assign("/login?expired=1");
    }
    throw new ApiError(
      obj.message || `Request failed (${response.status})`,
      response.status,
      obj.errors || {},
    );
  }
  return json as T;
}

const base = "/api/backend/requests";
const encoded = (id: number) => `${base}/${encodeURIComponent(String(id))}`;
const post = <T,>(url: string, payload?: unknown) =>
  jsonRequest<ApiResponse<T>>(url, {
    method: "POST",
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

export const api = {
  login: (email: string, password: string) =>
    jsonRequest<ApiResponse<User>>("/api/session/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => jsonRequest<ApiResponse<User>>("/api/session/me"),
  logout: () =>
    jsonRequest<{ success: boolean }>("/api/session/logout", {
      method: "POST",
    }),
  requests: (filters?: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(filters || {}))
      if (value !== undefined && value !== "") qs.set(key, String(value));
    return jsonRequest<PaginatedResponse<ServiceRequest>>(
      `${base}${qs.size ? `?${qs.toString()}` : ""}`,
    );
  },
  request: (id: number) =>
    jsonRequest<ApiResponse<ServiceRequest>>(encoded(id)),
  create: (input: RequestInput & { submit: boolean }) =>
    post<ServiceRequest>(base, input),
  update: (id: number, input: RequestInput) =>
    jsonRequest<ApiResponse<ServiceRequest>>(encoded(id), {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  submit: (id: number) => post<ServiceRequest>(`${encoded(id)}/submit`),
  decision: (
    id: number,
    decision: "approve" | "reject" | "return",
    comment: string,
  ) => post<ServiceRequest>(`${encoded(id)}/decision`, { decision, comment }),
  assign: (id: number, assigned_to: number, comment?: string) =>
    post<ServiceRequest>(`${encoded(id)}/assign`, {
      assigned_to,
      ...(comment ? { comment } : {}),
    }),
  status: (id: number, status: "in_progress" | "completed", comment?: string) =>
    post<ServiceRequest>(`${encoded(id)}/status`, {
      status,
      ...(comment ? { comment } : {}),
    }),
  comment: (id: number, body: string) =>
    post(`${encoded(id)}/comments`, { body }),
  activity: (id: number, page: number) =>
    jsonRequest<PaginatedResponse<RequestActivity>>(
      `${encoded(id)}/activity?page=${page}`,
    ),
};
