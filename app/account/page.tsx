import { redirect } from "next/navigation";
import { requireUser } from "@/lib/permissions";

export default async function AccountHome() {
  const user = await requireUser();
  if (user.role === "STUDENT") redirect("/student");
  if (user.role === "PLATFORM_ADMIN") redirect("/admin");
  redirect("/college");
}
