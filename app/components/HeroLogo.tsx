export default function HeroLogo() {
  return (
    // full-bleed pour sortir du container
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden select-none py-6">
      <h1
        className="whitespace-nowrap font-normal leading-[0.9] text-[clamp(56px,12vw,178px)] text-neutral-900"
        aria-label="GIL ANSELMI"
      >
        GIL&nbsp;ANSELMI
      </h1>
    </section>
  );
}
