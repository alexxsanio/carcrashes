const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    removeToken();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return response;
}