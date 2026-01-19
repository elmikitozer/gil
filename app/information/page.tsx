export const dynamic = 'force-dynamic';
export const metadata = { title: 'Informations — Gil Anselmi' };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-[clamp(32px,10vh,96px)]">
      <div className="flex flex-col md:flex-row md:gap-12 lg:gap-16 items-start">
        {/* Vidéo à gauche */}
        <div className="w-full mt-8 md:w-1/2 mb-8 md:mb-0">
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

        {/* Texte à droite */}
        <div className="mt-auto mb-auto w-full md:w-1/2 text-justify">
          <h1 className="font-medium text-[clamp(18px,5vw,24px)]">
            Gil Anselmi is a Paris-based photographer and director.
          </h1>
          <h2 className="mt-2 text-[clamp(12px,3.8vw,14px)] text-neutral-700 dark:text-neutral-300 leading-relaxed">
            &quot;She creates images that are bold and dreamlike, weaving together glossy aesthetics and
            surreal narratives. Characterized by a playful yet precise visual language, her work
            explores the boundary between reality and imagination, offering stories that feel both
            strikingly new and timeless.&quot;
          </h2>

          <h3 className="mt-[clamp(24px,6vh,40px)] text-[clamp(11px,2.8vw,12px)] font-medium tracking-[0.22em] text-neutral-900 dark:text-neutral-100">
            GENERAL INQUIRIES
          </h3>
          <a
            href="mailto:contact@gilanselmi.com"
            className="underline hover:opacity-80 transition text-[clamp(12px,3.2vw,14px)]"
          >
            contact@gilanselmi.com
          </a>
          <h3 className="mt-[clamp(16px,4vh,24px)] text-[clamp(12px,3.4vw,14px)] font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Commercial portfolio upon request
          </h3>
        </div>
      </div>
    </section>
  );
}
