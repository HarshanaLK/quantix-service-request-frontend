import { NextRequest, NextResponse } from "next/server";
import {
  badGateway,
  getToken,
  laravelFetch,
  noSession,
  passJson,
} from "@/lib/backend";

// Only expose endpoints that exist in the current Laravel API.
function allowed(method: string, parts: string[]) {
  if (parts[0] !== "requests") return false;
  if (parts.length === 1) return ["GET", "POST"].includes(method);
  if (!/^\d+$/.test(parts[1])) return false;
  if (parts.length === 2) return ["GET", "PUT"].includes(method);
  if (parts.length === 3) {
    if (parts[2] === "activity") return method === "GET";
    return (
      method === "POST" &&
      ["submit", "decision", "assign", "status", "comments"].includes(parts[2])
    );
  }
  return false;
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!allowed(req.method, path))
    return NextResponse.json(
      { message: "Unknown API route." },
      { status: 404 },
    );
  const token = getToken(req);
  if (!token) return noSession();
  const url = `/${path.join("/")}${req.nextUrl.search}`;
  try {
    const body =
      req.method === "POST" || req.method === "PUT"
        ? await req.text()
        : undefined;
    return passJson(
      await laravelFetch(url, { method: req.method, body }, token),
    );
  } catch {
    return badGateway();
  }
}
export const GET = handler;
export const POST = handler;
export const PUT = handler;
