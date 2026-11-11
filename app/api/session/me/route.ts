import { NextRequest } from "next/server";
import { badGateway, getToken, laravelFetch, noSession, passJson } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return noSession();
  try { return passJson(await laravelFetch("/me", {}, token)); }
  catch { return badGateway(); }
}
