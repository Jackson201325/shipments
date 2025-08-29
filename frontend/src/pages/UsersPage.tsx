import { useUsers } from "@/lib/useUsers";
import { impersonate, signOut } from "@/lib/devAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UsersPage() {
  const { data = [], status, error, refetch } = useUsers();
  const navigate = useNavigate();

  const handleImpersonate = async (id: number) => {
    await impersonate(id);
    await refetch();
    navigate("/shipments");
  };

  const handleSignOut = async () => {
    signOut();
    await refetch();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Users</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users list</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "pending" && <div>Loading…</div>}
          {status === "error" && (
            <div className="text-red-600">
              {(error as Error).message || "Failed to load users"}
            </div>
          )}
          {status === "success" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{u.id}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">{u.name ?? "—"}</td>
                      <td className="py-2 pr-4">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <Button
                          size="sm"
                          onClick={() => handleImpersonate(u.id)}
                        >
                          Impersonate
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-muted-foreground">
                        No users yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-3">
                <Button variant="destructive" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
