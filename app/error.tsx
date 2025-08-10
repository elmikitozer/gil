// app/error.tsx
"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl md:text-3xl">Un problème est survenu</h1>
      <p className="mt-3 text-neutral-600">Veuillez réessayer.</p>
      <button onClick={() => reset()} className="mt-6 underline">Recharger</button>
    </main>
  );
}
