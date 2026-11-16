import InfoLayout from '@/app/components/InfoLayout';

export const metadata = {
  title: 'Information — Gil Anselmi',
  description: 'Contact and about information for Gil Anselmi, photographer based in Paris.',
  alternates: { canonical: 'https://gilanselmi.com/information' },
  openGraph: {
    title: 'Information — Gil Anselmi',
    description: 'Contact and about information for Gil Anselmi, photographer based in Paris.',
    url: 'https://gilanselmi.com/information',
  },
};

export default function ContactPage() {
  return (
    <InfoLayout>
      <h1 className="font-medium text-[clamp(18px,5vw,24px)] xl:whitespace-nowrap">
        Gil Anselmi is a Paris-based photographer and director.
      </h1>
      <p className="mt-2 font-serif tracking-tight text-[clamp(12px,3.8vw,14px)] text-neutral-700 leading-relaxed">
        &quot;She creates images that are bold and dreamlike, weaving together glossy aesthetics and
        surreal narratives. Characterized by a playful yet precise visual language, her work
        explores the boundary between reality and imagination, offering stories that feel both
        strikingly new and timeless.&quot;
      </p>

      <h2 className="mt-[clamp(24px,6vh,40px)] text-[clamp(11px,2.8vw,12px)] font-medium leading-normal tracking-[0.22em] text-neutral-900">
        GENERAL INQUIRIES
      </h2>
      <a
        href="mailto:contact@gilanselmi.com"
        className="underline hover:opacity-80 transition text-[clamp(12px,3.2vw,14px)]"
      >
        contact@gilanselmi.com
      </a>
      <p className="mt-[clamp(16px,4vh,24px)] font-serif tracking-tight text-[clamp(12px,3.4vw,14px)] font-medium text-neutral-700 leading-relaxed">
        Commercial portfolio upon request
      </p>
    </InfoLayout>
  );
}
