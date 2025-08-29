import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { APILocation } from "../../../packages/shared/dist/esm/schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371; // Radius of earth km
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(s)));
}

export function formatAddress(loc: APILocation | null | undefined) {
  if (!loc) return "—";
  const line1 = [loc.address1, loc.address2].filter(Boolean).join(", ");
  const line2 = [
    loc.city,
    loc.state && loc.state.trim(),
    loc.postalCode && loc.postalCode.trim(),
    loc.country,
  ]
    .filter(Boolean)
    .join(", ");
  return [line1, line2].filter(Boolean).join(" · ");
}
