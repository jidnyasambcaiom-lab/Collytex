import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";

export async function POST(request: Request) {
  await endSession();
  if (request.headers.get("accept")?.includes("text/html")) return NextResponse.redirect(new URL("/", request.url), 303);
  return NextResponse.json({ ok: true });
}
