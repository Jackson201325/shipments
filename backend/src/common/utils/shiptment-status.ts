type ShipmentStatus = 'In Transit' | 'On Time' | 'Delayed';

export function deriveStatus(s: {
  pickupAt: Date | null;
  expectedDeliveryAt: Date | null;
  deliveredAt: Date | null;
}): ShipmentStatus {
  const now = new Date();
  if (s.deliveredAt) {
    if (!s.expectedDeliveryAt) return 'On Time';
    return s.deliveredAt <= s.expectedDeliveryAt ? 'On Time' : 'Delayed';
  }
  if (s.pickupAt && s.pickupAt <= now) return 'In Transit';
  return 'In Transit';
}
