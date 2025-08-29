import { useQuery } from "@tanstack/react-query";
import { PaginatedShipments } from "@app/shared";
import { apiFetch } from "./api";
import { getActiveToken } from "./devAuth";

export function useShipments(page: number, perPage = 20) {
  const token = getActiveToken(); // so cache busts when you switch user

  return useQuery({
    queryKey: ["shipments", token, page, perPage],
    enabled: !!token,
    queryFn: async () => {
      const raw = await apiFetch(`/shipments?page=${page}&perPage=${perPage}`);
      return PaginatedShipments.parse(raw);
    },
  });
}
