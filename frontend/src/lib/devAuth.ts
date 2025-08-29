const KEY = "auth.token";
export const TOKEN_EVENT = "auth-token-changed";

export function setActiveToken(token: string | null) {
  if (token) localStorage.setItem(KEY, token);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(TOKEN_EVENT));
}

export function getActiveToken(): string | null {
  return localStorage.getItem(KEY);
}

export function decodeEmailFromJwt(token: string | null): string | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return json.email ?? null;
  } catch {
    return null;
  }
}

export async function impersonate(userId: number) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/dev/impersonate/${userId}`,
  );
  if (!res.ok) throw new Error(await res.text());
  const { token } = await res.json();
  setActiveToken(token); // fires TOKEN_EVENT
  return token;
}

export function signOut() {
  setActiveToken(null);
}
