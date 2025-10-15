import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Informations — Gil Anselmi' };

export default function ContactPage() {
  const randomImage = {
    src: `/dogs/dog${Math.floor((Math.random() * 100) % 11)}.webp`,
    width: 200,
    height: 277,
  };

  return (
    <section className="mx-auto max-w-2xl px-4 text-center py-[clamp(32px,10vh,96px)]">
      {/* Texte informations */}
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

      <div className="relative mx-auto mt-[clamp(24px,6vh,40px)] w-[clamp(160px,50vw,288px)] h-[clamp(160px,50vw,288px)]">
        <Image
          src={randomImage}
          alt="Dog"
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 60vw, 288px"
        />
      </div>
    </section>
  );
}
