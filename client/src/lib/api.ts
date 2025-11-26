// client/src/lib/api.ts

// Reynum að lesa úr Vite env breytu fyrst
const ENV_API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

// Föllback: ef env er ekki til (eða tómt), notum Render backend beint
const API_BASE_URL =
  (ENV_API_BASE && ENV_API_BASE.trim()) || "https://utsalapp.onrender.com";

export function apiUrl(path: string) {
  // Ef path er þegar full slóð, skilar henni óbreyttri
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Tryggjum að path byrji á /
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
