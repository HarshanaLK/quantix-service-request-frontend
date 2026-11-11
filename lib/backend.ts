import { NextRequest, NextResponse } from "next/server";

const apiBase = () => (process.env.LARAVEL_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
export const COOKIE_NAME = "quantix_session";

export async function laravelFetch(path: string, init: RequestInit = {}, token?: string) {
  return fetch(`${apiBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function badGateway() {
  return NextResponse.json({ success: false, message: "Cannot connect to Laravel API. Verify LARAVEL_API_URL and start php artisan serve." }, { status: 502 });
}

export async function passJson(upstream: Response) {
  const body = await upstream.text();
  try {
    return NextResponse.json(JSON.parse(body), { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: upstream.ok ? "Invalid response from Laravel API." : `Laravel API returned HTTP ${upstream.status}.` }, { status: upstream.ok ? 502 : upstream.status });
  }
}

export function getToken(req: NextRequest) { return req.cookies.get(COOKIE_NAME)?.value; }
export function noSession() { return NextResponse.json({ success: false, message: "Please sign in." }, { status: 401 }); }
