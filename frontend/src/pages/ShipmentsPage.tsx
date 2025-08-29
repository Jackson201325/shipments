import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveToken } from "@/lib/devAuth";
import { deriveStatus, type Shipment } from "@app/shared";
import { useShipments } from "@/lib/useInfiniteShipments";

const PER_PAGE = 20;

export function ShipmentsPage() {
  const token = getActiveToken();
  const [page, setPage] = useState(1);
  const {
    data = [],
    status,
    error,
    isFetching,
    refetch,
  } = useShipments(page, PER_PAGE);

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

  const items: Shipment[] = data;

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
          return (
            <Card key={s.id} className="w-full">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Shipment #{s.id}</CardTitle>
                <span className="text-sm text-muted-foreground">{status}</span>
              </CardHeader>
              <CardContent className="flex justify-between text-sm">
                <div>
                  Size: <b>{s.size}</b>
                </div>
                {s.notes && (
                  <div className="text-muted-foreground">{s.notes}</div>
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
