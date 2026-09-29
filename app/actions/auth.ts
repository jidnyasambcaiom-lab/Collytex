"use server";

import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9._-]+$/).transform((value) => value.toLowerCase()),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
  loginType: z.enum(["STUDENT", "COLLEGE", "ADMIN"]).optional(),
});

type AuthResult = { success: true; role: string; redirect: string } | { success: false; error: string };

export async function signupUser(formData: FormData): Promise<AuthResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { success: false, error: "Check your details and use a password with at least 12 characters." };

  try {
    const { name, username, email, password } = parsed.data;
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, role: "STUDENT" },
      select: { id: true },
    });
    await startSession(user.id);
    return { success: true, role: "STUDENT", redirect: "/student" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "That email or username is already in use." };
    }
    console.error("Student signup failed", error);
    return { success: false, error: "Unable to create your account right now. Please try again." };
  }
}

export async function loginUser(identifier: string, password: string, loginType?: "STUDENT" | "COLLEGE" | "ADMIN"): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({ identifier, password, loginType });
  if (!parsed.success) return { success: false, error: "Enter a username or email and password." };

  const { identifier: normalizedIdentifier, password: submittedPassword } = parsed.data;
  try {
    const identifierHash = createHash("sha256").update(normalizedIdentifier).digest("hex");
    const now = new Date();
    const priorAttempt = await prisma.loginAttempt.findUnique({ where: { identifierHash } });
    if (priorAttempt?.blockedUntil && priorAttempt.blockedUntil > now) {
      return { success: false, error: "Username, email, or password is incorrect. Try again later." };
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }] },
      select: { id: true, passwordHash: true, role: true },
    });
    if (!user || !(await verifyPassword(submittedPassword, user.passwordHash))) {
      const recent = priorAttempt && now.getTime() - priorAttempt.windowStartedAt.getTime() < 15 * 60 * 1000;
      const failedAttempts = recent ? priorAttempt.failedAttempts + 1 : 1;
      await prisma.loginAttempt.upsert({
        where: { identifierHash },
        create: {
          identifierHash,
          failedAttempts,
          windowStartedAt: now,
          blockedUntil: failedAttempts >= 8 ? new Date(now.getTime() + 15 * 60 * 1000) : null,
        },
        update: {
          failedAttempts,
          windowStartedAt: recent ? priorAttempt.windowStartedAt : now,
          blockedUntil: failedAttempts >= 8 ? new Date(now.getTime() + 15 * 60 * 1000) : null,
        },
      });
      return { success: false, error: "Username, email, or password is incorrect." };
    }

    const loginTypeMatches =
      !loginType ||
      (loginType === "STUDENT" && (user.role === "STUDENT" || user.role === "PLATFORM_ADMIN")) ||
      (loginType === "COLLEGE" && (user.role === "COLLEGE_HEAD" || user.role === "COLLEGE_BRANCH")) ||
      (loginType === "ADMIN" && user.role === "PLATFORM_ADMIN");
    if (!loginTypeMatches) return { success: false, error: "Username, email, or password is incorrect." };

    await prisma.loginAttempt.deleteMany({ where: { identifierHash } });
    await startSession(user.id);
    const redirect = user.role === "PLATFORM_ADMIN" ? "/developer" : user.role === "STUDENT" ? "/student" : "/college";
    return { success: true, role: user.role, redirect };
  } catch (error) {
    console.error("Login failed", error);
    return { success: false, error: "Unable to sign in right now. Please try again." };
  }
}
