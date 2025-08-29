import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";

export type Shipment = {
  id: number;
  size: "S" | "M" | "L" | "XL";
  notes: string | null;
  pickupAt: string | null;
  expectedDeliveryAt: string | null;
  deliveredAt: string | null;
};

type PageResponse = Shipment[];

const PAGE_SIZE = 20;

async function fetchShipments({ pageParam = 1 }: { pageParam?: number }) {
  const data: PageResponse = await apiFetch(
    `/shipments?page=${pageParam}&perPage=${PAGE_SIZE}`,
  );

  return {
    items: data,
    nextCursor: data.length === PAGE_SIZE ? pageParam + 1 : null,
  };
}

export function useInfiniteShipments() {
  return useInfiniteQuery({
    queryKey: ["shipments"],
    queryFn: fetchShipments,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
