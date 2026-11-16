import InfoLayout from '@/app/components/InfoLayout';

export const metadata = {
  title: 'Mentions légales — Gil Anselmi',
  description: 'Mentions légales du site de Gil Anselmi.',
  alternates: { canonical: 'https://gilanselmi.com/mentions-legales' },
  openGraph: {
    title: 'Mentions légales — Gil Anselmi',
    url: 'https://gilanselmi.com/mentions-legales',
  },
  robots: { index: false, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <InfoLayout lang="fr">
      <h1 className="font-bold text-[clamp(18px,5vw,24px)]">
        Mentions légales
      </h1>

      <h2 className="mt-[clamp(20px,5vh,32px)] text-[clamp(11px,2.8vw,12px)] font-semibold tracking-[0.22em] text-neutral-900 leading-normal">
        ÉDITEUR DU SITE
      </h2>
      <p className="mt-1 text-[clamp(12px,3.2vw,14px)] text-neutral-700 leading-snug">
        Gil Anselmi — Photographe<br />
        <a
          href="https://maps.google.com/?q=14+rue+des+Grilles,+93500+Pantin"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition"
        >
          14 rue des Grilles, 93500 Pantin
        </a><br />
        <a
          href="mailto:contact@gilanselmi.com"
          className="underline hover:opacity-80 transition"
        >
          contact@gilanselmi.com
        </a><br />
        SIRET : 833 531 627 00028
      </p>

      <h2 className="mt-[clamp(14px,3vh,20px)] text-[clamp(11px,2.8vw,12px)] font-semibold tracking-[0.22em] text-neutral-900 leading-normal">
        DIRECTRICE DE LA PUBLICATION
      </h2>
      <p className="mt-1 text-[clamp(12px,3.2vw,14px)] text-neutral-700 leading-relaxed">
        <a
          href="https://www.instagram.com/gilanselmi"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition"
        >
          Gil Anselmi
        </a>
      </p>

      <h2 className="mt-[clamp(28px,6vh,40px)] text-[clamp(10px,2.5vw,11px)] font-semibold tracking-[0.22em] text-neutral-700 leading-normal">
        HÉBERGEMENT
      </h2>
      <p className="mt-0.5 text-[clamp(10px,2.8vw,12px)] text-neutral-500 leading-tight">
        Vercel Inc. —{' '}
        <a
          href="https://maps.google.com/?q=440+N+Barranca+Ave,+Covina,+CA+91723,+USA"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition"
        >
          440 N Barranca Ave #4133, Covina, CA 91723, USA
        </a>
      </p>

      <h2 className="mt-[clamp(6px,1.2vh,10px)] text-[clamp(10px,2.5vw,11px)] font-semibold tracking-[0.22em] text-neutral-700 leading-normal">
        PROPRIÉTÉ INTELLECTUELLE
      </h2>
      <p className="mt-0.5 text-[clamp(10px,2.8vw,12px)] text-neutral-500 leading-tight">
        L&apos;ensemble du contenu de ce site est la propriété exclusive de Gil Anselmi, protégé par le droit d&apos;auteur. Toute reproduction est interdite sans autorisation écrite.
      </p>
    </InfoLayout>
  );
}
