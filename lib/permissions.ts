import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export async function requireUser(roles?: readonly string[]) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/account");
  return user;
}
