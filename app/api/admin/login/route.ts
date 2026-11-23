import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_SECONDS,
  adminConfigured,
  createSessionValue,
  passwordMatches,
} from '@/lib/admin-auth';

// Connexion à la page d'envoi des vidéos : POST { password } (JSON).
// Réponse : 204 et cookie de session, 401 si le mot de passe est faux.
export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'La page d’envoi n’est pas configurée.' }, { status: 503 });
  }
  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    // corps absent ou invalide : traité comme un mot de passe vide
  }
  if (!passwordMatches(password)) {
    // Ralentit les essais en série.
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return new NextResponse(null, { status: 204 });
}
