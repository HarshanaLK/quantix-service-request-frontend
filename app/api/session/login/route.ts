import { NextRequest, NextResponse } from "next/server";
import { badGateway, COOKIE_NAME, laravelFetch, passJson } from "@/lib/backend";
import type { User } from "@/lib/types";

export async function POST(req: NextRequest) {
  let credentials: { email?: unknown; password?: unknown };
  try { credentials = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 }); }
  if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") {
    return NextResponse.json({ message: "Email and password are required." }, { status: 422 });
  }
  try {
    const upstream = await laravelFetch("/login", { method: "POST", body: JSON.stringify(credentials) });
    if (!upstream.ok) return passJson(upstream);
    const payload = await upstream.json() as { success: boolean; message: string; data?: { token: string; user: User } };
    if (!payload.data?.token || !payload.data?.user) return NextResponse.json({ message: "Unexpected login response from backend." }, { status: 502 });
    // Browser JavaScript never sees the Laravel Sanctum bearer token.
    const result = NextResponse.json({ success: true, message: payload.message, data: payload.data.user });
    result.cookies.set(COOKIE_NAME, payload.data.token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
    });
    return result;
  } catch { return badGateway(); }
}
