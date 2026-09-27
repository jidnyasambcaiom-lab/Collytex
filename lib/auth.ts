import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const cookieName = "collytex_session";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  const jar = await cookies();
  jar.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => undefined);
  jar.delete(cookieName);
}

export async function currentUser() {
  try {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, select: { userId: true, expiresAt: true } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
      return null;
    }
    return await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true, role: true, collegeId: true, branchId: true } });
  } catch { return null; }
}
