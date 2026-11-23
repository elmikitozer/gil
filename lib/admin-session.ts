import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, isValidSession } from '@/lib/admin-auth';

/** Vrai si la requête en cours porte une session valide de la page d'envoi. */
export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  return isValidSession(store.get(SESSION_COOKIE)?.value);
}
