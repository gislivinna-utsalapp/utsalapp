// client/src/lib/api.ts

const API_BASE_URL = "https://utsalapp.onrender.com";

export function apiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const url = apiUrl(path);

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
}
