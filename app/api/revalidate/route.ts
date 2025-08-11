// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

function ok(json: unknown, init?: ResponseInit) {
  return Response.json(json, init);
}

function authorized(url: string) {
  const secret = new URL(url).searchParams.get("secret");
  return secret === process.env.REVALIDATE_SECRET;
}

export async function GET(req: Request) {
  if (!authorized(req.url)) return ok({ ok: false, reason: "unauthorized" }, { status: 401 });
  revalidatePath("/");
  return ok({ ok: true, revalidated: true, method: "GET" });
}

export async function POST(req: Request) {
  if (!authorized(req.url)) return ok({ ok: false, reason: "unauthorized" }, { status: 401 });
  revalidatePath("/");
  return ok({ ok: true, revalidated: true, method: "POST" });
}
