#!/usr/bin/env node
// Remplace, dans la story « home » de Storyblok (brouillon, sans publier), les 13 liens vidéo de
// la grille et celui de Pastel 001 dans l'album « Luis De Javier » par les liens R2 de la table
// de migration (docs/VIDEOS_R2.md). Le bloc Miumiu n'est pas touché.
//
// Jetons lus dans .env.local (jamais affichés) : STORYBLOK_MANAGEMENT_TOKEN (API de gestion),
// STORYBLOK_PREVIEW_TOKEN (identifiant de l'espace).
//
// Usage (une étape à la fois) :
//   node scripts/storyblok-migrate-videos.mjs sauvegarde  <dossier>   télécharge la story (JSON complet)
//   node scripts/storyblok-migrate-videos.mjs simulation  <dossier>   liste les remplacements, n'écrit rien
//   node scripts/storyblok-migrate-videos.mjs ecriture    <dossier>   enregistre en brouillon (sans publier)
//   node scripts/storyblok-migrate-videos.mjs verification <dossier>  compare la story en ligne à la sauvegarde
//   node scripts/storyblok-migrate-videos.mjs restauration <dossier>  remet le contenu sauvegardé (brouillon)
//
// Garde-fous : la simulation et l'écriture refusent d'agir si le contenu a changé depuis la
// sauvegarde, si un bloc est introuvable ou en double, ou si l'ancien lien n'est pas celui attendu.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SLUG = 'home';
const R2 = 'https://pub-077dd9d9d31e445e93c96024bb4992c6.r2.dev/uploads/';

// uid (début), nom du fichier actuel (fin du lien, décodée), nouveau fichier — table de docs/VIDEOS_R2.md
const MIGRATION = [
  ['eae3ba8d', 'Pastel_Beauty_Project_001.mov', 'pastel-beauty-project-001-6qmsyy-624x464.mp4'],
  ['34eaef9c', '0114.mov', '0114-t588s5-1080x1410.mp4'],
  ['a89b5a36', '1121_V4.mov', '1121-v4-8cls18-1080x1512.mp4'],
  ['43f398cb', 'Pastel_Beauty_Project_002.mp4', 'pastel-beauty-project-002-41lr9q-768x512.mp4'],
  ['8535382a', 'Pastel_Beauty_Project_006.mp4', 'pastel-beauty-project-006-3zb1pk-768x512.mp4'],
  ['c378c9d6', '0114 (1).mov', '0114-1-3ksywl-1080x1512.mp4'],
  ['e404e2ea', '1121_V2.mov', '1121-v2-6knn3s-1080x1512.mp4'],
  ['570f7b59', '1121_V5.mov', '1121-v5-trfdaz-1080x1512.mp4'],
  ['9099b416', 'GA_IG_POST01.mp4', 'ga-ig-post01-812uyq-1920x1080.mp4'],
  ['e0bc6835', '1121_V6.mov', '1121-v6-fodeln-1080x1512.mp4'],
  ['0cc723d9', 'InstaGil.mp4', 'instagil-rmc8us-720x720.mp4'],
  ['9b87a515', '1121_V3.mov', '1121-v3-eccuxs-1080x1512.mp4'],
  ['ffe634e8', 'UGG_COMMERCIAL1025.mov', 'ugg-commercial1025-f9ej0l-1920x1080.mp4'],
  ['bae9c3e2', 'Pastel_Beauty_Project_001_hz7lo5.mov', 'pastel-beauty-project-001-6qmsyy-624x464.mp4'],
];
const UNTOUCHED = 'a442c04e'; // Miumiu (album) : laissé tel quel

const [command, dirArg] = process.argv.slice(2);
if (!command || !dirArg) {
  console.error('Usage : node scripts/storyblok-migrate-videos.mjs <sauvegarde|simulation|ecriture|verification|restauration> <dossier>');
  process.exit(1);
}
const dir = path.resolve(dirArg);
if (dir.startsWith(ROOT + path.sep)) {
  console.error('Le dossier de sauvegarde doit être HORS du dépôt.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')
    .map((l) => /^([A-Z0-9_]+)=(.*)$/.exec(l.trim())).filter(Boolean)
    .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, '')])
);
for (const k of ['STORYBLOK_MANAGEMENT_TOKEN', 'STORYBLOK_PREVIEW_TOKEN']) {
  if (!env[k]) { console.error(`${k} absent de .env.local`); process.exit(1); }
}

async function api(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { Authorization: env.STORYBLOK_MANAGEMENT_TOKEN, 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`API de gestion : ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function spaceId() {
  const res = await fetch(`https://api.storyblok.com/v2/cdn/spaces/me?token=${env.STORYBLOK_PREVIEW_TOKEN}`);
  if (!res.ok) throw new Error(`Espace introuvable (${res.status})`);
  return (await res.json()).space.id;
}

const mapi = (space) => `https://mapi.storyblok.com/v1/spaces/${space}`;

async function liveStory(space, storyId) {
  return (await api(`${mapi(space)}/stories/${storyId}`)).story;
}

function readBackup() {
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const story = JSON.parse(fs.readFileSync(path.join(dir, `story-${SLUG}.json`), 'utf8')).story;
  return { manifest, story };
}

// Tous les blocs video_item du contenu, avec leur chemin.
function videoBlocks(node, at = 'content', out = []) {
  if (Array.isArray(node)) node.forEach((v, i) => videoBlocks(v, `${at}[${i}]`, out));
  else if (node && typeof node === 'object') {
    if (node.component === 'video_item') out.push({ at, blok: node });
    for (const [k, v] of Object.entries(node)) videoBlocks(v, `${at}.${k}`, out);
  }
  return out;
}

// Différences entre deux valeurs JSON, chemin par chemin.
function diff(a, b, at = '', out = []) {
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], Array.isArray(a) ? `${at}[${k}]` : `${at}.${k}`, out);
  } else out.push({ at, before: a, after: b });
  return out;
}

const fileOf = (url) => decodeURIComponent(String(url || '').split('/').pop());

// Contenu cible : copie du contenu actuel où seuls les 14 champs srcMp4 changent.
function plan(content) {
  const next = structuredClone(content);
  const blocks = videoBlocks(next);
  const rows = [];
  for (const [uid, oldFile, newFile] of MIGRATION) {
    const found = blocks.filter((b) => String(b.blok._uid).startsWith(uid));
    if (found.length !== 1) throw new Error(`Bloc ${uid} : ${found.length} trouvé(s), 1 attendu`);
    const { at, blok } = found[0];
    if (fileOf(blok.srcMp4) !== oldFile) {
      throw new Error(`Bloc ${uid} : lien actuel « ${blok.srcMp4} », attendu un lien vers « ${oldFile} »`);
    }
    rows.push({ uid: blok._uid, at, before: blok.srcMp4, after: R2 + newFile });
    blok.srcMp4 = R2 + newFile;
  }
  const miumiu = blocks.filter((b) => String(b.blok._uid).startsWith(UNTOUCHED));
  if (miumiu.length !== 1) throw new Error(`Bloc Miumiu ${UNTOUCHED} : ${miumiu.length} trouvé(s)`);
  const changes = diff(content, next);
  if (changes.length !== MIGRATION.length || !changes.every((c) => c.at.endsWith('.srcMp4'))) {
    throw new Error(`Différence inattendue : ${changes.length} champ(s) modifié(s)`);
  }
  return { next, rows, miumiu: miumiu[0].blok.srcMp4 };
}

function printRows(rows) {
  rows.forEach((r, i) => {
    console.log(`${String(i + 1).padStart(2)}. bloc ${r.uid}  (${r.at.replace(/^content\./, '')})`);
    console.log(`    avant : ${r.before}`);
    console.log(`    après : ${r.after}`);
  });
}

const space = await spaceId();

if (command === 'sauvegarde') {
  if (fs.existsSync(dir) && fs.readdirSync(dir).length) throw new Error(`Le dossier ${dir} existe déjà et n'est pas vide`);
  fs.mkdirSync(dir, { recursive: true });
  const list = await api(`${mapi(space)}/stories?with_slug=${SLUG}`);
  if (list.stories?.length !== 1) throw new Error(`Story « ${SLUG} » : ${list.stories?.length} trouvée(s)`);
  const storyId = list.stories[0].id;
  const full = await api(`${mapi(space)}/stories/${storyId}`);
  fs.writeFileSync(path.join(dir, `story-${SLUG}.json`), JSON.stringify(full, null, 2));
  // Pour mémoire : la version publiée actuelle (API de diffusion).
  const pub = await fetch(`https://api.storyblok.com/v2/cdn/stories/${SLUG}?version=published&token=${env.STORYBLOK_PREVIEW_TOKEN}&cv=${Date.now()}`);
  fs.writeFileSync(path.join(dir, `story-${SLUG}-publiee.json`), await pub.text());
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ space, storyId, slug: SLUG, savedAt: new Date().toISOString(), updatedAt: full.story.updated_at, published: full.story.published, unpublishedChanges: full.story.unpublished_changes }, null, 2));
  console.log(`Sauvegarde : ${dir}`);
  console.log(`  story « ${SLUG} » (id ${storyId}), modifiée le ${full.story.updated_at}, brouillon non publié en attente : ${full.story.unpublished_changes ? 'oui' : 'non'}`);
  console.log(`  blocs video_item : ${videoBlocks(full.story.content).length}`);
  process.exit(0);
}

const { manifest, story: saved } = readBackup();
const live = await liveStory(space, manifest.storyId);

if (command === 'simulation' || command === 'ecriture') {
  const changedSinceBackup = diff(saved.content, live.content);
  if (changedSinceBackup.length) throw new Error(`Le contenu a changé depuis la sauvegarde (${changedSinceBackup.length} champ(s)) : refaites une sauvegarde.`);
  const { next, rows, miumiu } = plan(live.content);
  console.log(`${rows.length} remplacements (seul le champ srcMp4 de chaque bloc change) :\n`);
  printRows(rows);
  console.log(`\nLaissé tel quel : bloc Miumiu ${UNTOUCHED} → ${miumiu}`);
  if (command === 'simulation') {
    console.log('\nSimulation : rien n’a été écrit.');
    process.exit(0);
  }
  await api(`${mapi(space)}/stories/${manifest.storyId}`, {
    method: 'PUT',
    body: JSON.stringify({ story: { name: live.name, slug: live.slug, content: next } }),
  });
  console.log('\nÉcriture : story enregistrée en brouillon (non publiée).');
  process.exit(0);
}

if (command === 'verification') {
  const changes = diff(saved.content, live.content);
  const { rows } = plan(saved.content);
  const byPath = new Map(rows.map((r) => [r.at.replace(/^content/, ''), r]));
  let ok = changes.length === rows.length;
  for (const c of changes) {
    const r = byPath.get(c.at.replace(/\.srcMp4$/, ''));
    const good = r && c.at.endsWith('.srcMp4') && c.before === r.before && c.after === r.after;
    if (!good) ok = false;
    console.log(`${good ? 'OK ' : 'INATTENDU'} ${c.at}\n    ${c.before}\n  → ${c.after}`);
  }
  console.log(`\n${changes.length} champ(s) différent(s) de la sauvegarde ; attendus : ${rows.length}. ${ok ? 'Conforme : seuls les 14 liens ont changé.' : 'NON CONFORME.'}`);
  console.log(`Publiée : ${live.published ? 'oui' : 'non'} | modifications non publiées : ${live.unpublished_changes ? 'oui' : 'non'}`);
  process.exit(ok ? 0 : 2);
}

if (command === 'restauration') {
  await api(`${mapi(space)}/stories/${manifest.storyId}`, {
    method: 'PUT',
    body: JSON.stringify({ story: { name: saved.name, slug: saved.slug, content: saved.content } }),
  });
  const after = await liveStory(space, manifest.storyId);
  const left = diff(saved.content, after.content);
  console.log(`Restauration (brouillon) : ${left.length === 0 ? 'contenu identique à la sauvegarde' : `${left.length} différence(s) restante(s)`}.`);
  process.exit(left.length === 0 ? 0 : 2);
}

console.error(`Commande inconnue : ${command}`);
process.exit(1);
