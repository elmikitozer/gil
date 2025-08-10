// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl md:text-3xl">Page introuvable</h1>
      <p className="mt-3 text-neutral-600">La page demandée n’existe pas.</p>
      <Link href="/" className="mt-6 underline">Back to Home</Link>
    </main>
  );
}
