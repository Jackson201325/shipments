import { type PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <p className="overflow-auto flex-1">{children}</p>
    </div>
  );
}
