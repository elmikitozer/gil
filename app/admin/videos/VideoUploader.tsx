'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Stored = { key: string; url: string; poster: string | null; size: number; lastModified: string };

type Step =
  | { kind: 'idle' }
  | { kind: 'working'; label: string; fraction: number | null }
  | { kind: 'done'; url: string; note: string }
  | { kind: 'error'; message: string };

type Presigned = { key: string; uploadUrl: string; headers: Record<string, string>; publicUrl: string };

const mb = (bytes: number) => `${(bytes / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;
const date = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

class UploadError extends Error {}

async function presign(body: object): Promise<Presigned> {
  const res = await fetch('/api/admin/videos/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new UploadError('Votre session a expiré : rechargez la page et reconnectez-vous.');
  const data = (await res.json().catch(() => ({}))) as Partial<Presigned> & { error?: string };
  if (!res.ok || !data.uploadUrl) throw new UploadError(data.error || 'L’envoi n’a pas pu être autorisé. Réessayez.');
  return data as Presigned;
}

/** PUT direct vers R2, avec progression (fetch ne la donne pas pour l'envoi). */
function put(target: Presigned, blob: Blob, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', target.uploadUrl);
    for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new UploadError(`Le stockage a refusé le fichier (erreur ${xhr.status}). Réessayez.`));
    xhr.onerror = () => reject(new UploadError('L’envoi a été interrompu : vérifiez votre accès à Internet et réessayez.'));
    xhr.send(blob);
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt('Copiez le lien :', text);
        }
      }}
      className="shrink-0 rounded border border-neutral-900 px-3 py-1 text-sm hover:bg-neutral-900 hover:text-white"
    >
      {copied ? 'Copié' : 'Copier'}
    </button>
  );
}

export default function VideoUploader() {
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [videos, setVideos] = useState<Stored[] | null>(null);
  const [listError, setListError] = useState('');
  const [canCompressHere, setCanCompressHere] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const busy = step.kind === 'working';

  const loadList = useCallback(
    () =>
      fetch('/api/admin/videos', { cache: 'no-store' })
        .then(async (res) => {
          const data = (await res.json().catch(() => ({}))) as { videos?: Stored[]; error?: string };
          if (!res.ok) throw new Error(data.error || 'La liste des vidéos n’a pas pu être lue.');
          setVideos(data.videos ?? []);
          setListError('');
        })
        .catch((e: unknown) =>
          setListError(e instanceof Error ? e.message : 'La liste des vidéos n’a pas pu être lue.')
        ),
    []
  );

  useEffect(() => {
    loadList();
    import('@/lib/video-compress').then(({ canCompress }) => canCompress().then(setCanCompressHere));
  }, [loadList]);

  // Avertit avant de quitter la page pendant une préparation ou un envoi.
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  async function handle(file: File) {
    setStep({ kind: 'working', label: 'Analyse de la vidéo…', fraction: null });
    try {
      const { prepareVideo, posterAndSize, PrepareError } = await import('@/lib/video-compress');
      let prepared;
      try {
        prepared = await prepareVideo(file, (stage, fraction) =>
          setStep({
            kind: 'working',
            label: stage === 'analyse' ? 'Analyse de la vidéo…' : 'Compression de la vidéo…',
            fraction: stage === 'analyse' ? null : fraction,
          })
        );
      } catch (e) {
        if (e instanceof PrepareError) throw new UploadError(e.message);
        console.error(e);
        throw new UploadError(
          'La vidéo n’a pas pu être préparée. Essayez dans Google Chrome, ou convertissez-la avec HandBrake (voir la fiche « Préparer une vidéo »).'
        );
      }
      setStep({ kind: 'working', label: 'Création de l’affiche…', fraction: null });
      let poster;
      try {
        poster = await posterAndSize(prepared.blob);
      } catch (e) {
        if (e instanceof PrepareError) throw new UploadError(e.message);
        throw new UploadError('L’affiche de la vidéo n’a pas pu être créée. Réessayez dans Google Chrome.');
      }

      const target = await presign({
        kind: 'video',
        name: file.name,
        size: prepared.blob.size,
        width: poster.width,
        height: poster.height,
      });
      setStep({ kind: 'working', label: 'Envoi de la vidéo…', fraction: 0 });
      await put(target, prepared.blob, (fraction) => setStep({ kind: 'working', label: 'Envoi de la vidéo…', fraction }));
      const posterTarget = await presign({ kind: 'poster', videoKey: target.key, size: poster.poster.size });
      setStep({ kind: 'working', label: 'Envoi de l’affiche…', fraction: null });
      await put(posterTarget, poster.poster);

      const note =
        prepared.action === 'compressed'
          ? `Vidéo compressée : ${mb(prepared.originalBytes)} → ${mb(prepared.blob.size)}.`
          : `Vidéo envoyée sans modification (${mb(prepared.blob.size)}).`;
      setStep({ kind: 'done', url: target.publicUrl, note });
      void loadList();
    } catch (e) {
      setStep({
        kind: 'error',
        message: e instanceof UploadError ? e.message : 'Une erreur inattendue est survenue. Réessayez.',
      });
      if (!(e instanceof UploadError)) console.error(e);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && !busy) void handle(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-10">
      {!canCompressHere && (
        <p role="note" className="rounded border border-amber-600 bg-amber-50 px-4 py-3 text-amber-900">
          Ce navigateur ne sait pas compresser les vidéos correctement. Les vidéos déjà légères passent ; pour les autres,
          ouvrez cette page dans <strong>Google Chrome</strong>.
        </p>
      )}

      <label
        htmlFor="video-file"
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={[
          'flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed px-6 py-10 text-center',
          dragging ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-400',
          busy ? 'cursor-wait opacity-60' : '',
        ].join(' ')}
      >
        <span className="text-lg">Glissez une vidéo ici</span>
        <span className="text-neutral-600">ou cliquez pour choisir un fichier (.mp4 ou .mov, 60 s au plus)</span>
        <input
          ref={inputRef}
          id="video-file"
          type="file"
          accept="video/*,.mp4,.mov,.m4v"
          disabled={busy}
          onChange={(e) => onFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      <div aria-live="polite">
        {step.kind === 'working' && (
          <div className="flex flex-col gap-2">
            <p>{step.label}</p>
            <div className="h-2 w-full overflow-hidden rounded bg-neutral-200">
              <div
                className={step.fraction === null ? 'h-full w-1/3 animate-pulse bg-neutral-500' : 'h-full bg-neutral-900'}
                style={step.fraction === null ? undefined : { width: `${Math.round(step.fraction * 100)}%` }}
              />
            </div>
            <p className="text-sm text-neutral-600">Ne fermez pas cette page avant la fin.</p>
          </div>
        )}
        {step.kind === 'done' && (
          <div className="flex flex-col gap-3 rounded border border-green-700 bg-green-50 px-4 py-4">
            <p className="text-green-900">C’est en ligne. {step.note}</p>
            <p className="text-sm text-neutral-700">
              Copiez ce lien et collez-le dans le champ « srcMp4 » du bloc vidéo, dans Storyblok :
            </p>
            <div className="flex items-center gap-3">
              <code className="min-w-0 flex-1 break-all rounded bg-white px-2 py-1 text-sm">{step.url}</code>
              <CopyButton text={step.url} />
            </div>
          </div>
        )}
        {step.kind === 'error' && (
          <p role="alert" className="rounded border border-red-700 bg-red-50 px-4 py-3 text-red-900">
            {step.message}
          </p>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">Vidéos déjà envoyées</h2>
        {listError && (
          <p role="alert" className="text-red-700">
            {listError}
          </p>
        )}
        {videos && videos.length === 0 && <p className="text-neutral-600">Aucune vidéo pour l’instant.</p>}
        {videos && videos.length > 0 && (
          <ul className="flex flex-col divide-y divide-neutral-200">
            {videos.map((v) => (
              <li key={v.key} className="flex items-center gap-3 py-3">
                {v.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vignette d'administration, hors site public
                  <img src={v.poster} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-14 w-14 shrink-0 rounded bg-neutral-200" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{v.key.replace(/^uploads\//, '')}</p>
                  <p className="text-xs text-neutral-600">
                    {mb(v.size)} · {date(v.lastModified)}
                  </p>
                </div>
                <CopyButton text={v.url} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={async () => {
          await fetch('/api/admin/logout', { method: 'POST' });
          window.location.reload();
        }}
        className="self-start text-sm text-neutral-600 underline"
      >
        Se déconnecter
      </button>
    </div>
  );
}
