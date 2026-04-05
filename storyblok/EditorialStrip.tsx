import { storyblokEditable, renderRichText } from "@storyblok/react/rsc";
import DOMPurify from "isomorphic-dompurify";

export default function EditorialStrip({ blok }: any) {
  const raw = blok?.text ? renderRichText(blok.text) : "";
  const html = raw ? DOMPurify.sanitize(raw) : "";

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
