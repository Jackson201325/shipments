import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { UsersArraySchema, type User } from "@app/shared";

async function fetchUsers(): Promise<User[]> {
  const raw = await apiFetch("/users");
  return UsersArraySchema.parse(raw);
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 60_000,
  });
}
