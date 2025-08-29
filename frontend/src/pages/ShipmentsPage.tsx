import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markDelivered } from "@/lib/api";
import { getActiveToken } from "@/lib/devAuth";
import { useShipments } from "@/lib/useInfiniteShipments";
import { distanceKm, formatAddress } from "@/lib/utils";
import {
  deriveStatus,
  isDeliveredLate,
  type APIShipment,
  type ShipmentStatus,
} from "@app/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";

const PER_PAGE = 20;

function deliveredClass(late: boolean) {
  return late ? "text-yellow-500" : "text-green-600";
}

const statusMeta: Record<
  Exclude<ShipmentStatus, "Delivered">,
  { icon: React.ElementType; className: string }
> = {
  "On Time": { icon: CheckCircle2, className: "text-green-500" },
  "In Transit": { icon: Truck, className: "text-blue-500" },
  Delayed: { icon: AlertTriangle, className: "text-yellow-500" },
};

function MarkDeliveredButton({ id }: { id: number }) {
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => markDelivered(id),
    onMutate: async () => {
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
    onError: (_e, _v, ctx) => {
      ctx?.previous?.forEach(([key, old]) => qc.setQueryData(key, old));
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["shipments"] });
    },
  });

  return (
    <Button size="sm" onClick={() => mut.mutate()} disabled={mut.isPending}>
      {mut.isPending ? "Marking…" : "Mark Delivered"}
    </Button>
  );
}

export function ShipmentsPage() {
  const token = getActiveToken();
  const [page, setPage] = useState(1);

  const { data, status, error, isFetching } = useShipments(page, PER_PAGE);
  const items: APIShipment[] = data ?? [];

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
      </div>

      <div className="flex flex-col gap-3">
        {items.map((s) => {
          const st = deriveStatus({
            pickupAt: s.pickupAt,
            expectedDeliveryAt: s.expectedDeliveryAt,
            deliveredAt: s.deliveredAt,
          });

          let Icon: React.ElementType;
          let className: string;

          if (st === "Delivered") {
            Icon = PackageCheck;
            className = deliveredClass(
              isDeliveredLate({
                expectedDeliveryAt: s.expectedDeliveryAt,
                deliveredAt: s.deliveredAt,
              }),
            );
          } else {
            ({ icon: Icon, className } = statusMeta[st]);
          }

          const origin = s.origin;
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
              <CardHeader className="flex justify-between items-start">
                <CardTitle>Shipment #{s.id}</CardTitle>
                <span
                  className={`flex items-center gap-1 text-sm ${className}`}
                >
                  <Icon className="w-4 h-4" />
                  {st}
                </span>
              </CardHeader>

              <CardContent className="flex gap-8 items-start text-sm">
                <div>
                  <div className="font-medium">Origin</div>
                  <div className="text-muted-foreground">
                    {formatAddress(origin)}
                  </div>
                </div>

                <div>
                  <div className="font-medium">Destination</div>
                  <div className="text-muted-foreground">
                    {formatAddress(destination)}
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

                {!s.deliveredAt && (
                  <div className="flex items-center ml-auto">
                    <MarkDeliveredButton id={s.id} />
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
