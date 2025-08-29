import { getActiveToken } from "./devAuth";

const RAW_BASE = import.meta.env.VITE_API_URL;
const API_BASE = (RAW_BASE ?? "").replace(/\/+$/, "");

if (!API_BASE) {
  console.warn(
    "[api] VITE_API_URL is not set. Falling back to http://localhost:3000",
  );
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getActiveToken();

  const merged = new Headers(options.headers ?? {});

  if (!merged.has("Content-Type"))
    merged.set("Content-Type", "application/json");

  if (token) merged.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${RAW_BASE}${path}`, {
    ...options,
    headers: merged,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} ${res.statusText}${text ? ` – ${text}` : ""}`,
    );
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function markDelivered(id: number) {
  return apiFetch(`/shipments/${id}/deliver`, { method: "POST" });
}
