import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { startSession } from "@/lib/auth";

const credentials = z.object({
  identity: z.string().trim().min(1).max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
  loginType: z.enum(["STUDENT", "COLLEGE", "ADMIN"]).optional(),
});

export async function POST(request: Request) {
  const parsed = credentials.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a username or email and password." }, { status: 400 });
  try {
    const { identity, password, loginType } = parsed.data;
    const identifierHash = createHash("sha256").update(identity).digest("hex");
    const now = new Date();
    const priorAttempt = await prisma.loginAttempt.findUnique({ where: { identifierHash } });
    if (priorAttempt?.blockedUntil && priorAttempt.blockedUntil > now) return NextResponse.json({ error: "Username, email, or password is incorrect. Try again later." }, { status: 429 });
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identity }, { username: identity }] },
      select: { id: true, passwordHash: true, role: true },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      const recent = priorAttempt && now.getTime() - priorAttempt.windowStartedAt.getTime() < 15 * 60 * 1000;
      const failedAttempts = recent ? priorAttempt.failedAttempts + 1 : 1;
      await prisma.loginAttempt.upsert({ where: { identifierHash }, create: { identifierHash, failedAttempts, windowStartedAt: now, blockedUntil: failedAttempts >= 8 ? new Date(now.getTime() + 15 * 60 * 1000) : null }, update: { failedAttempts, windowStartedAt: recent ? priorAttempt.windowStartedAt : now, blockedUntil: failedAttempts >= 8 ? new Date(now.getTime() + 15 * 60 * 1000) : null } });
      return NextResponse.json({ error: "Username, email, or password is incorrect." }, { status: 401 });
    }
    const roleMatchesLoginType =
      !parsed.data.loginType ||
      (parsed.data.loginType === "STUDENT" && (user.role === "STUDENT" || user.role === "PLATFORM_ADMIN")) ||
      (parsed.data.loginType === "COLLEGE" && (user.role === "COLLEGE_HEAD" || user.role === "COLLEGE_BRANCH")) ||
      (parsed.data.loginType === "ADMIN" && user.role === "PLATFORM_ADMIN");
    if (!roleMatchesLoginType) return NextResponse.json({ error: "Username, email, or password is incorrect." }, { status: 401 });
    await prisma.loginAttempt.deleteMany({ where: { identifierHash } });
    await startSession(user.id);
    const redirectTo = user.role === "STUDENT" ? "/student" : user.role === "PLATFORM_ADMIN" ? "/developer" : "/college";
    return NextResponse.json({ ok: true, redirectTo });
  } catch { return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 503 }); }
}
