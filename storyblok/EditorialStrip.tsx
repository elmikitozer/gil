import { storyblokEditable, renderRichText } from "@storyblok/react/rsc";

export default function EditorialStrip({ blok }: any) {
  const html = blok?.text ? renderRichText(blok.text) : ""; // ← garde-fou

  return (
    <section {...storyblokEditable(blok)} className="mt-8 md:mt-12">
      <div className={`text-base md:text-lg ${blok?.align === "center" ? "text-center" : ""}`}>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : null}
      </div>
    </section>
  );
}
