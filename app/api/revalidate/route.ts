import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // Revalide la home (ajoute d'autres chemins si besoin)
  revalidatePath("/");
  return NextResponse.json({ ok: true, revalidated: true });
}
