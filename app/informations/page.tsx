import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = { title: "Informations — Gil Anselmi" };


export default function ContactPage() {
  const randomImage = { src:`/dogs/dog${Math.floor(Math.random() * 100 % 11)}.webp`, width: 200, height: 277 };
  return (
    <section className="mx-auto max-w-2xl min-h-[calc(100vh-var(--nav-h,64px))] grid place-items-center px-4 text-center">
      <div>
        {/* Texte informations */}
        <h1 className="text-2xl font-medium ">
          Gil Anselmi is a Paris-based photographer and director.
        </h1>
        <h2 className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 dark: leading-relaxed">
          &quot;She creates images that are bold and dreamlike, weaving together glossy
          aesthetics and surreal narratives. Characterized by a playful yet
          precise visual language, her work explores the boundary between
          reality and imagination, offering stories that feel both strikingly new
          and timeless.&quot;
        </h2>
        <h3 className="mt-10 text-sm font-medium tracking-widest text-bold-neutral-900 dark:text-neutral-100">
          GENERAL INQUIRIES
        </h3>
        <a
          href="mailto:contact@gilanselmi.com"
          className="underline hover:opacity-80 transition text-semibold-900"
          >
          contact@gilanselmi.com
        </a>
        <h3 className="mt-5 text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
          Commercial portfolio upon request
        </h3>
<div className="relative w-72 h-72 mx-auto"> {/* 18rem = 288px */}
  <Image
    src={randomImage}
    alt="Dog"
    fill
    style={{ objectFit: "contain" }}  // ou "cover" si tu veux remplir entièrement
    sizes="(max-width: 768px) 100vw, 800px" //
  />
</div>

      </div>
    </section>
  );
}
