import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginatedShipments, type Shipment } from "@app/shared";
import { apiFetch } from "./api";

type PageResponse = Shipment[];

const PAGE_SIZE = 20;

async function fetchShipments({ pageParam = 1 }: { pageParam?: number }) {
  const raw: PageResponse = await apiFetch(
    `/shipments?page=${pageParam}&perPage=${PAGE_SIZE}`,
  );

  const data = PaginatedShipments.parse(raw);

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
