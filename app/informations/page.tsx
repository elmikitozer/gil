import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = { title: "Informations — Gil Anselmi" };

const images = [
  { src: "/dog.png", width: 200, height: 277 },
  { src: "/dogs.png", width: 413, height: 267 },
];

export default function ContactPage() {
  const randomImage = images[Math.floor(Math.random() * images.length)];
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
        <div className="mb-8 ">
          {/* Image du chien */}
          <Image
            src={randomImage.src}
            alt="Dog"
            width={randomImage.width}
            height={randomImage.height}
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
