const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stageroom_token");
}

export function setToken(token: string) {
  localStorage.setItem("stageroom_token", token);
}

export function setUser(user: { email: string; user_id: number }) {
  localStorage.setItem("stageroom_user", JSON.stringify(user));
}

export function getUser(): { email: string; user_id: number } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("stageroom_user");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem("stageroom_token");
  localStorage.removeItem("stageroom_user");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${API}${path}`, { ...options, headers });
}
