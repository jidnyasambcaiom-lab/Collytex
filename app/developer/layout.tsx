import type { ReactNode } from "react";
import { DeveloperSidebar } from "@/components/developer-sidebar";
import { requireUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DeveloperLayout({ children }: { children: ReactNode }) {
  await requireUser(["PLATFORM_ADMIN"]);

  return (
    <div className="developer-layout">
      <DeveloperSidebar />
      <main className="developer-main">{children}</main>
    </div>
  );
}
