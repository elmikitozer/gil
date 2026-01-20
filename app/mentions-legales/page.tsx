export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mentions légales — Gil Anselmi' };

export default function MentionsLegalesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-[clamp(32px,10vh,96px)]">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center md:justify-center md:min-h-[70vh]">
        {/* Vidéo à gauche */}
        <div className="w-full mt-8 md:w-[45%] md:max-w-md mb-8 md:mb-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto"
          >
            <source src="/videos/info-video.webm" type="video/webm" />
            <source src="/videos/info-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Mentions légales à droite */}
        <div className="mt-auto mb-auto w-full md:w-[45%] md:max-w-md">
          <h1 className="font-bold text-[clamp(18px,5vw,24px)]">
            Mentions légales
          </h1>

          <h3 className="mt-[clamp(20px,5vh,32px)] text-[clamp(11px,2.8vw,12px)] font-semibold tracking-[0.22em] text-neutral-900 dark:text-neutral-100">
            ÉDITEUR DU SITE
          </h3>
          <p className="mt-1 text-[clamp(12px,3.2vw,14px)] text-neutral-700 dark:text-neutral-300 leading-snug">
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

          <h3 className="mt-[clamp(14px,3vh,20px)] text-[clamp(11px,2.8vw,12px)] font-semibold tracking-[0.22em] text-neutral-900 dark:text-neutral-100">
            DIRECTRICE DE LA PUBLICATION
          </h3>
          <p className="mt-1 text-[clamp(12px,3.2vw,14px)] text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <a
              href="https://www.instagram.com/gilanselmi"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition"
            >
              Gil Anselmi
            </a>
          </p>

          <h3 className="mt-[clamp(28px,6vh,40px)] text-[clamp(10px,2.5vw,11px)] font-semibold tracking-[0.22em] text-neutral-700 dark:text-neutral-400">
            HÉBERGEMENT
          </h3>
          <p className="mt-0.5 text-[clamp(10px,2.8vw,12px)] text-neutral-500 dark:text-neutral-400 leading-tight">
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

          <h3 className="mt-[clamp(6px,1.2vh,10px)] text-[clamp(10px,2.5vw,11px)] font-semibold tracking-[0.22em] text-neutral-700 dark:text-neutral-400">
            PROPRIÉTÉ INTELLECTUELLE
          </h3>
          <p className="mt-0.5 text-[clamp(10px,2.8vw,12px)] text-neutral-500 dark:text-neutral-400 leading-tight">
            L&apos;ensemble du contenu de ce site est la propriété exclusive de Gil Anselmi, protégé par le droit d&apos;auteur. Toute reproduction est interdite sans autorisation écrite.
          </p>
        </div>
      </div>
    </section>
  );
}
