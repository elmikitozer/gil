// import { getStoryblokApi } from "@storyblok/react/rsc";
// import { ensureStoryblok } from "@/lib/storyblok";

// export default async function ContactPage() {
//   ensureStoryblok();
//   const api = getStoryblokApi();
//   const { data } = await api.get("cdn/stories/contact", { version: "draft" });
//   const c = data.story.content;

//   return (
//     <main className="container mx-auto px-4 py-16">
//       <h1 className="text-3xl font-serif">Contact</h1>
//       <p className="mt-2">Email : {c.email}</p>
//       <p className="mt-2"><a href={c.instagram_url} target="_blank">Instagram</a></p>
//       <div className="prose mt-6">{/* agent text plus tard */}</div>
//     </main>
//   );
// }


// app/contact/page.tsx
export const metadata = { title: "Contact — Gil Anselmi" };

export default function ContactPage() {
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-medium mb-4 flex justify-center items-center mt-14 md:mt-16">Informations</h1>
      <p className="text-neutral-600  flex justify-center items-center">
        Pour toute demande, écrivez-moi à {" "}
        <a href="mailto:contact@gilanselmi.com" className="underline hover:opacity-80 transition">
          contact@gilanselmi.com
        </a>.
      </p>
    </section>
  );
}
