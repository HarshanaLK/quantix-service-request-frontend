import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getToken, laravelFetch } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const token = getToken(req);
  // Clear the browser session even if the Laravel API is temporarily unavailable.
  if (token) {
    try {
      await laravelFetch("/logout", { method: "POST" }, token);
    } catch {
      /* best-effort revocation */
    }
  }
  const result = NextResponse.json({ success: true, message: "Signed out." });
  result.cookies.delete(COOKIE_NAME);
  return result;
}
