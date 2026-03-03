import { API_BASE } from "../context/Api";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; message?: string };
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type StoredUser = {
  token?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

const getAuthToken = () => {
  const u = getStoredUser();
  return u?.token as string | undefined;
};

const clearStoredUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  config: { auth?: boolean } = { auth: true }
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (config.auth) {
    const token = getAuthToken();
    if (!token) {
      clearStoredUser();
      throw new Error("Not authorized, no token");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiResponse<T> | unknown) : null;

  if (!res.ok) {
    const message = isRecord(json) && typeof json.message === "string" ? json.message : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (isRecord(json) && "success" in json) {
    if (json.success === true) {
      return (json as ApiSuccess<T>).data;
    }
    const message = typeof json.message === "string" ? json.message : "Request failed";
    throw new Error(message);
  }

  return json as T;
};
