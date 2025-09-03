// app/contact/page.tsx
export const metadata = { title: "Contact — Gil Anselmi" };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl min-h-[calc(100vh-var(--nav-h,64px))] grid place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-medium mb-4">Informations</h1>
        <p className="text-neutral-600">
          Pour toute demande, écrivez-moi à{" "}
          <a href="mailto:contact@gilanselmi.com" className="underline hover:opacity-80 transition">
            contact@gilanselmi.com
          </a>.
        </p>
      </div>
    </section>
  );
}

