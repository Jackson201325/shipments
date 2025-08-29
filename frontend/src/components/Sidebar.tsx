import { NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Package, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { decodeEmailFromJwt, getActiveToken, TOKEN_EVENT } from "@/lib/devAuth";

export function Sidebar() {
  const link =
    "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground";
  const active = "bg-accent text-accent-foreground";

  const [email, setEmail] = useState<string | null>(() =>
    decodeEmailFromJwt(getActiveToken()),
  );

  useEffect(() => {
    const update = () => setEmail(decodeEmailFromJwt(getActiveToken()));
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "auth.token") update();
    };

    window.addEventListener(TOKEN_EVENT, update);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(TOKEN_EVENT, update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <aside className="hidden sticky top-0 flex-col p-4 w-64 h-screen border-r md:flex">
      <div className="px-2 mb-2 text-lg font-semibold">Logistics Dashboard</div>
      <Separator className="mb-4" />
      <nav className="flex flex-col gap-1">
        <NavLink
          to="/shipments"
          className={({ isActive }) => `${link} ${isActive ? active : ""}`}
        >
          <Package className="w-4 h-4" />
          Shipments
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => `${link} ${isActive ? active : ""}`}
        >
          <Users className="w-4 h-4" />
          Users
        </NavLink>
      </nav>
      <div className="px-2 pt-4 mt-auto text-xs text-muted-foreground">
        {email ? `Logged in as ${email}` : "Not logged in"}
      </div>
    </aside>
  );
}
