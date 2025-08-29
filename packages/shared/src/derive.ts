export type ShipmentStatus = "In Transit" | "On Time" | "Delayed" | "Delivered";

function toDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}

/**
 * Rules:
 * - deliveredAt != null  -> "Delivered"
 *    • Use isDeliveredLate(...) to tell if it was late or on time.
 * - deliveredAt == null:
 *    • pickupAt in future -> "On Time"  (not started yet but scheduled)
 *    • pickupAt now/past  -> "In Transit"
 *    • no pickupAt but expected in future -> "In Transit" (assume in progress)
 *    • fallback -> "On Time"
 */
export function deriveStatus(input: {
  pickupAt: string | Date | null;
  expectedDeliveryAt: string | Date | null;
  deliveredAt: string | Date | null;
}): ShipmentStatus {
  const pickupAt = toDate(input.pickupAt);
  const expected = toDate(input.expectedDeliveryAt);
  const delivered = toDate(input.deliveredAt);
  const now = new Date();

  if (delivered) return "Delivered";

  if (pickupAt && pickupAt.getTime() <= now.getTime()) return "In Transit";
  if (expected && expected.getTime() >= now.getTime()) return "In Transit";

  return "On Time";
}

/** For delivered shipments, tell if they were late. */
export function isDeliveredLate(input: {
  expectedDeliveryAt: string | Date | null;
  deliveredAt: string | Date | null;
}): boolean {
  const expected = toDate(input.expectedDeliveryAt);
  const delivered = toDate(input.deliveredAt);
  if (!delivered) return false;
  if (!expected) return false; // no promise => treat as on time
  return delivered.getTime() > expected.getTime();
}
