import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";
import { APIShipmentsArraySchema, type APIShipment } from "@app/shared";
import { getActiveToken } from "./devAuth";

export function useShipments(page: number, perPage: number) {
  const token = getActiveToken();

  return useQuery({
    queryKey: ["shipments", token, page, perPage],
    enabled: !!token,
    queryFn: async (): Promise<APIShipment[]> => {
      const raw = await apiFetch(`/shipments?page=${page}&perPage=${perPage}`);
      return APIShipmentsArraySchema.parse(raw);
    },
    placeholderData: keepPreviousData,
  });
}
