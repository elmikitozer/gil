// app/global-error.tsx
"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <html><body>
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl md:text-3xl">Erreur</h1>
        <button onClick={() => reset()} className="mt-6 underline">Recharger</button>
      </main>
    </body></html>
  );
}
