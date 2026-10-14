// Reusable fetch-based API client. Token is attached per request,
// 204 responses resolve to null, and backend error messages are preserved.
import type {
  InterestGroup,
  ListResponse,
  Note,
  Post,
  User,
  UserPostsResponse,
} from "./types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "")
  || "http://localhost:5000/api";

const TOKEN_KEY = "secure_notes_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiErrorShape {
  status: number;
  message: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.errors = shape.errors;
  }
}

let onUnauthorized: (() => void) | null = null;

// AuthProvider registers this so any 401 anywhere logs the user out once.
export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const details = err.errors?.map((e) => `${e.field}: ${e.message}`).join("; ");
    return details ? `${err.message} — ${details}` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
  const hasBody = init.body !== undefined;
  if (hasBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (res.status === 204) return null as T;
  if (res.status === 401) {
    clearToken();
    onUnauthorized?.();
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const payload = (body ?? {}) as { message?: string; errors?: { field: string; message: string }[] };
    throw new ApiError({
      status: res.status,
      message: payload.message || `Request failed (${res.status})`,
      errors: payload.errors,
    });
  }
  return body as T;
}

const get = <T,>(path: string): Promise<T> => request<T>(path);
const post = <T,>(path: string, data: unknown): Promise<T> =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });
const patch = <T,>(path: string, data: unknown): Promise<T> =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
const del = <T,>(path: string): Promise<T> => request<T>(path, { method: "DELETE" });

export function pageQuery(page: number, limit = 10): string {
  return `?page=${page}&limit=${limit}`;
}

// --- Auth ---
export const authApi = {
  register: (data: { username: string; email: string; password: string; interests: string[] }) =>
    post<{ user: User; token: string }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    post<{ user: User; token: string }>("/auth/login", data),
  me: () => get<{ user: User }>("/auth/me"),
};

// --- Notes (own notes; admins read others only via /notes/all) ---
export const notesApi = {
  list: (page: number, limit = 10) =>
    get<ListResponse<Note>>(`/notes${pageQuery(page, limit)}`),
  get: (id: string) => get<{ note: Note }>(`/notes/${id}`),
  create: (data: { title: string; content: string }) =>
    post<{ note: Note }>("/notes", data),
  update: (id: string, data: { title?: string; content?: string }) =>
    patch<{ note: Note }>(`/notes/${id}`, data),
  remove: (id: string) => del<null>(`/notes/${id}`),
  listAll: (page: number, limit = 10, author?: string) =>
    get<ListResponse<Note>>(
      `/notes/all${pageQuery(page, limit)}${author ? `&author=${encodeURIComponent(author)}` : ""}`,
    ),
};

// --- Public posts ---
export const postsApi = {
  list: (page: number, limit = 10) =>
    get<ListResponse<Post>>(`/posts${pageQuery(page, limit)}`),
  listByUser: (userId: string, page: number, limit = 10) =>
    get<UserPostsResponse>(`/posts/user/${userId}${pageQuery(page, limit)}`),
  create: (data: { title: string; body: string }) =>
    post<{ post: Post }>("/posts", data),
};

// --- Admin user management ---
export const usersApi = {
  list: (page: number, limit = 10) =>
    get<ListResponse<User>>(`/users${pageQuery(page, limit)}`),
  get: (id: string) => get<{ user: User }>(`/users/${id}`),
  create: (data: { username: string; email: string; password: string; role?: string; interests?: string[] }) =>
    post<{ user: User }>("/users", data),
  update: (id: string, data: Record<string, unknown>) =>
    patch<{ user: User }>(`/users/${id}`, data),
  remove: (id: string) => del<null>(`/users/${id}`),
  byInterests: (page: number, limit = 10, interest?: string) =>
    get<ListResponse<InterestGroup>>(
      `/users/by-interests${pageQuery(page, limit)}${interest ? `&interest=${encodeURIComponent(interest)}` : ""}`,
    ),
};
