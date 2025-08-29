// frontend/src/pages/ShipmentsPage.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markDelivered } from "@/lib/api";
import { getActiveToken } from "@/lib/devAuth";
import { useShipments } from "@/lib/useInfiniteShipments";
import { deriveStatus, type APIShipment } from "@app/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const PER_PAGE = 20;

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
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

export function ShipmentsPage() {
  const token = getActiveToken();
  const [page, setPage] = useState(1);

  const {
    data, // APIShipment[] | undefined
    status,
    error,
    isFetching,
    refetch,
  } = useShipments(page, PER_PAGE);

  const items: APIShipment[] = data ?? [];

  const qc = useQueryClient();
  const deliverMut = useMutation({
    mutationFn: (id: number) => markDelivered(id),
    onMutate: async (id) => {
      // Optimistically set deliveredAt on any shipments query cache
      const previous = qc.getQueriesData<APIShipment[]>({
        queryKey: ["shipments"],
      });
      previous.forEach(([key, old]) => {
        if (!old) return;
        const updated = old.map((s) =>
          s.id === id ? { ...s, deliveredAt: new Date().toISOString() } : s,
        );
        qc.setQueryData(key, updated);
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      // rollback
      ctx?.previous?.forEach(([key, old]) => qc.setQueryData(key, old));
    },
    onSettled: async () => {
      // revalidate so UI also reflects any external DB changes
      await qc.invalidateQueries({ queryKey: ["shipments"] });
    },
  });

  if (!token) {
    return (
      <div className="p-6 text-sm">
        Sign in (impersonate) on the Users page first.
      </div>
    );
  }
  if (status === "pending") return <div className="p-6">Loading…</div>;
  if (status === "error")
    return (
      <div className="p-6 text-destructive">{(error as Error).message}</div>
    );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Shipments</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((s) => {
          const status = deriveStatus({
            pickupAt: s.pickupAt,
            expectedDeliveryAt: s.expectedDeliveryAt,
            deliveredAt: s.deliveredAt,
          });

          const origin = s.origin; // ✅ typed from APIShipment
          const destination = s.destination;

          const km =
            origin?.lat != null &&
            origin?.lng != null &&
            destination?.lat != null &&
            destination?.lng != null
              ? distanceKm(
                  { lat: origin.lat, lng: origin.lng },
                  { lat: destination.lat, lng: destination.lng },
                )
              : null;

          return (
            <Card key={s.id} className="w-full">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Shipment #{s.id}</CardTitle>
                <span className="text-sm text-muted-foreground">{status}</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <div className="font-medium">Origin</div>
                    <div className="text-muted-foreground">
                      {origin?.nickname ?? origin?.city ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Destination</div>
                    <div className="text-muted-foreground">
                      {destination?.nickname ?? destination?.city ?? "—"}
                    </div>
                  </div>
                  {km !== null && (
                    <div>
                      <div className="font-medium">Distance</div>
                      <div className="text-muted-foreground">{km} km</div>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">Size</div>
                    <div className="text-muted-foreground">{s.size}</div>
                  </div>
                </div>

                {status === "In Transit" && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => deliverMut.mutate(s.id)}
                      disabled={deliverMut.isPending}
                    >
                      {deliverMut.isPending ? "Marking…" : "Mark Delivered"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">No shipments.</div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          Prev
        </Button>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={isFetching || items.length < PER_PAGE}
        >
          Next
        </Button>
        <span className="self-center text-sm text-muted-foreground">
          Page {page}
        </span>
      </div>
    </div>
  );
}
