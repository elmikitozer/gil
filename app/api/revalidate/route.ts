import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// (optionnel) force le runtime Node si tu utilises des libs Node
export const runtime = "nodejs";

export async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    // log côté Vercel pour débug
    console.log("Revalidate 401: bad or missing secret");
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  // revalide la home; ajoute d’autres chemins si besoin
  revalidatePath("/");

  return NextResponse.json({ ok: true, revalidated: true, at: new Date().toISOString() });
}

// Autorise POST (webhook) et GET (test rapide au navigateur)
export async function POST(req: NextRequest) { return handler(req); }
export async function GET(req: NextRequest) { return handler(req); }
