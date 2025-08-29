import { deriveStatus } from "../derive";

describe("deriveStatus", () => {
  const now = new Date();

  it('returns "On Time" when delivered before ETA', () => {
    const status = deriveStatus({
      pickupAt: new Date(now.getTime() - 2 * 3600_000),
      expectedDeliveryAt: new Date(now.getTime() - 1 * 3600_000),
      deliveredAt: new Date(now.getTime() - 90 * 60_000),
    });
    expect(status).toBe<"On Time">("On Time");
  });

  it('returns "Delayed" when delivered after ETA', () => {
    const status = deriveStatus({
      pickupAt: new Date(now.getTime() - 5 * 3600_000),
      expectedDeliveryAt: new Date(now.getTime() - 2 * 3600_000),
      deliveredAt: new Date(now.getTime() - 30 * 60_000),
    });
    expect(status).toBe<"Delayed">("Delayed");
  });

  it('returns "In Transit" when picked up but not delivered', () => {
    const status = deriveStatus({
      pickupAt: new Date(now.getTime() - 1 * 3600_000),
      expectedDeliveryAt: new Date(now.getTime() + 6 * 3600_000),
      deliveredAt: null,
    });
    expect(status).toBe<"In Transit">("In Transit");
  });

  it('returns "In Transit" when pickup is in the future (per current rule)', () => {
    const status = deriveStatus({
      pickupAt: new Date(now.getTime() + 2 * 3600_000),
      expectedDeliveryAt: new Date(now.getTime() + 12 * 3600_000),
      deliveredAt: null,
    });
    expect(status).toBe<"In Transit">("In Transit");
  });

  it('returns "On Time" when delivered and no ETA provided', () => {
    const status = deriveStatus({
      pickupAt: null,
      expectedDeliveryAt: null,
      deliveredAt: new Date(now.getTime() - 1 * 3600_000),
    });
    expect(status).toBe<"On Time">("On Time");
  });
});
