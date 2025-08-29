import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInfiniteShipments } from "@/lib/useInfiniteShipments";
import { deriveStatus, type Shipment } from "@app/shared";
import { useEffect, useRef } from "react";

export function ShipmentsPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteShipments();

  // simple intersection observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "pending") return <div className="p-6">Loading…</div>;
  if (status === "error")
    return (
      <div className="p-6 text-destructive">{(error as Error).message}</div>
    );

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Shipments</h1>

      hello
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s: Shipment) => {
          const status = deriveStatus({
            pickupAt: s.pickupAt,
            expectedDeliveryAt: s.expectedDeliveryAt,
            deliveredAt: s.deliveredAt,
          });
          return (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>Shipment #{s.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  Size: <b>{s.size}</b>
                </div>
                <div className="text-sm">
                  Status: <b>{status}</b>
                </div>
                {s.notes && (
                  <div className="text-sm text-muted-foreground">{s.notes}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center items-center py-6">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : (
        <div className="py-6 text-sm text-center text-muted-foreground">
          No more shipments
        </div>
      )}

      {/* auto loader */}
      <div ref={sentinelRef} />
    </div>
  );
}
