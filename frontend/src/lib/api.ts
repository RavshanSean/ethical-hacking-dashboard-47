import { API_BASE_URL, WS_BASE_URL } from "@/config/api";
import { getToken, logout } from "@/lib/auth";

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalized}`, {
    ...init,
    headers,
  });

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !normalized.startsWith("/auth/")
  ) {
    logout();
  }

  return response;
}

export function authenticatedWsUrl(path: string): string {
  const token = getToken() || "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = `${WS_BASE_URL}${normalized}`;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}token=${encodeURIComponent(token)}`;
}
