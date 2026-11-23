import type { Metadata } from 'next';
import { adminConfigured } from '@/lib/admin-auth';
import { hasAdminSession } from '@/lib/admin-session';
import { r2Configured } from '@/lib/r2';
import LoginForm from './LoginForm';
import VideoUploader from './VideoUploader';

// Page privée d'envoi des vidéos vers Cloudflare R2. Hors sitemap, « noindex »
// (balise et en-tête X-Robots-Tag, voir next.config.ts), protégée par mot de passe.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Envoyer une vidéo — Gil Anselmi',
  robots: { index: false, follow: false },
};

export default async function AdminVideosPage() {
  let content: React.ReactNode;
  if (!adminConfigured() || !r2Configured()) {
    content = (
      <p role="alert" className="text-neutral-700">
        Cette page n’est pas encore configurée (mot de passe ou stockage manquant).
      </p>
    );
  } else if (!(await hasAdminSession())) {
    content = <LoginForm />;
  } else {
    content = <VideoUploader />;
  }
  return (
    <main lang="fr" className="mx-auto w-full max-w-2xl px-4 pt-24 pb-24 sm:px-6">
      <h1 className="mb-8 text-2xl">Envoyer une vidéo</h1>
      {content}
    </main>
  );
}
