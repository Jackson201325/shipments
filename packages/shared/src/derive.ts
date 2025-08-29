export type ShipmentStatus = "In Transit" | "On Time" | "Delayed";

export const deriveStatus = (s: {
  pickupAt: string | Date | null;
  expectedDeliveryAt: string | Date | null;
  deliveredAt: string | Date | null;
}): ShipmentStatus => {
  const toDate = (d: any) => (d ? new Date(d) : null);
  const pickupAt = toDate(s.pickupAt);
  const expected = toDate(s.expectedDeliveryAt);
  const delivered = toDate(s.deliveredAt);

  if (delivered) {
    if (!expected) return "On Time";
    return delivered <= expected ? "On Time" : "Delayed";
  }
  if (pickupAt && pickupAt <= new Date()) return "In Transit";
  return "In Transit";
};
