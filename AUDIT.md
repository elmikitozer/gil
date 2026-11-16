# Audit et corrections — gilanselmi.com

Dernière mise à jour : 2026-11-16, fin du lot 4, partie A.
Branche de travail : `fix/audit` (32 commits de correction depuis `15fbdd8`, plus ceux de ce document ; **rien n'est poussé ni déployé**).
Projet Vercel : `gil` (domaine `gilanselmi.com`). Le dossier local est lié par erreur au projet vide `anselmi`.

Ce document est mis à jour à la fin de chaque lot.

## 1. État d'avancement

| Lot | Contenu | Statut |
|---|---|---|
| 0 | Base de référence : un seul lockfile (pnpm), lint réparé | **Fait** |
| 1 | Rendu et coût serveur : pages statiques, home rendue côté serveur et mise en cache, webhook | **Fait**, validé, testé sur la preview Vercel |
| 2 | Sécurité : Next.js, jeton côté serveur, aperçu signé, webhook | **Fait**, validé, testé sur la preview Vercel |
| 3 | Nettoyage : code, CSS, mode sombre, Edge Config, fichiers publics | **Fait**, validé |
| 4A | Grille et images : rendu serveur, lightbox, débordement | **Fait**, en attente de votre validation |
| 4B | Accessibilité, SEO, qualité, factorisation | **À faire** |

### Vérifications à la fin du lot 3

| Vérification | Résultat |
|---|---|
| Typecheck (`pnpm typecheck`) | passe, 0 erreur |
| Lint (`pnpm lint`) | 0 erreur, 0 warning |
| Build (`pnpm build`, Next 16.4.6) | passe ; `/`, `/information`, `/mentions-legales` en statique |
| Tests du lot 1 rejoués | pages statiques en cache, réchauffement après webhook, panne Storyblok simulée : home servie en 200 |
| Tests du lot 2 rejoués | webhook : GET/PUT 405, secret absent ou faux 401, bon secret 200 ; aperçu : signature valide 200, sinon 404 |
| Jeton absent du JavaScript public | 0 fichier sur 26 dans `.next/static`, 0 sur 265 dans `.next/server` |
| Navigateur (Chrome sans interface) | 0 erreur console sur la home, l'aperçu signé, `/information`, `/mentions-legales`, la page 404 |
| Poids de `public/` (fichiers suivis) | 40,48 Mo → 23,63 Mo (23 → 6 fichiers) |
| Arbre de travail | propre ; `next.config.ts` identique au commit |

Les tests ont été faits en local (`next start`) et, pour les lots 1 et 2, par vos soins sur la preview Vercel. Les tests de panne utilisent un simulateur local (aucun appel au vrai Storyblok n'a été coupé).

## 2. Lots et commits

### Lot 0 — Base de référence

| Commit | Objet |
|---|---|
| `4a12d47` | Suppression de `package-lock.json`, champ `packageManager` (pnpm 10.15.1) |
| `998d2b2` | Lint réparé : `eslint .` direct, config flat native, script `typecheck` |

Constats : le lint était cassé (commande `next lint` retirée dans Next 16, et config `FlatCompat` incompatible). Il y avait 16 `any` bloquants, et non 15 comme annoncé dans le rapport initial.

### Lot 1 — Rendu et coût serveur

| Commit | Objet |
|---|---|
| `3034f40` | Suppression de `ThemeToogle.tsx` |
| `34a02e0` | `next-env.d.ts` n'est plus versionné |
| `20a5fdc` | `sharp` et `unrs-resolver` dans `pnpm.onlyBuiltDependencies` |
| `bb79255` | `MediaItem` : calcul d'album inutilisé retiré |
| `8ceb302` | Props `blok` typées (une interface par bloc, sans `any`) |
| `8764968` | `/information` et `/mentions-legales` en statique |
| `61f55c8` | `EditorialStrip` rendu en éléments React, sans DOMPurify |
| `f99db7a` | Registres de blocs séparés : `registry.server.ts` et `registry.client.ts` |
| `aa0ec9a` | Home rendue côté serveur et mise en cache ; pont Storyblok réservé à l'éditeur (`/storyblok-preview`) |
| `a0f9836` | Gestion d'erreur autour de la lecture Storyblok (`StoryblokFetchError`, 404 → `notFound`) |
| `598842e` | Webhook : `revalidateTag` avec profil `max` (l'ancienne page reste servie pendant la régénération et en cas de panne) |

Ajustements demandés après le lot 1 :

| Commit | Objet |
|---|---|
| `0595fca` | Le webhook réchauffe la home après sa réponse (`after`) |
| `6c41769` | Année du pied de page indépendante de la date de build (`CurrentYear`) |

### Lot 2 — Sécurité

| Commit | Objet |
|---|---|
| `9173569` | Next.js 16.1.3 → 16.4.6 (dernière version stable de la branche 16) ; `eslint-config-next` aligné |
| `fb65cc7` | Jeton lu côté serveur seulement : `STORYBLOK_PREVIEW_TOKEN`, module `server-only`, `.env.example` |
| `fd4c6af` | `/storyblok-preview` verrouillé par la signature Storyblok (sha1 de `space_id:jeton:timestamp`, 1 h de validité) ; 404 sinon |
| `91adacb` | Webhook : POST seul, signature `webhook-signature` — **remplacé par `63c6943`** |
| `4143f0e` | `dompurify` et `@types/dompurify` retirés |
| `63c6943` | Webhook : POST seul, secret dans l'URL (plan Storyblok gratuit), comparaison en temps constant |

Preuves : 0 occurrence du jeton dans `.next/static` et `.next/server`. Les avis de sécurité sur `next` et `dompurify` ont disparu de `pnpm audit`.

### Lot 3 — Nettoyage

| Commit | Objet |
|---|---|
| `d0da6fe` | `.env.example` : Storyblok signe l'aperçu avec le premier jeton preview |
| `5f423ed` | Classes Tailwind écrites en toutes lettres (`Lightbox`, `SplitDiptych`) |
| `80c9c64` | Six fichiers jamais importés supprimés : `LightboxFocusTrap`, `useEscape`, `StoryblokBridgeInner`, `JustifiedGallery`, `lib/unknown`, `VideoItemHybrid` |
| `b1065c4` | Lightbox interne jamais ouverte retirée de `ZoomableVideo` et `ZoomableVimeo` |
| `dfde112` | `LightboxClose`, `CloseIcon` et le CSS mort supprimés |
| `6731838` | Mode sombre supprimé (jamais activé : plus rien n'ajoutait la classe `dark`) |
| `9d30e60` | Mécanisme Edge Config supprimé (+ `@vercel/edge-config`, `image-size`, `@storyblok/js`) ; `HeroFullBleed` réparé ; `MediaItem` hors grille retiré |
| `f9d415e` | Fichiers publics et faux fichier de police supprimés |

Chaque suppression a été précédée d'une recherche prouvant l'absence d'importeur. Pour les fichiers publics, le contenu Storyblok (publié et brouillon, toutes les stories) a aussi été lu via l'API.

Le message de `f9d415e` a été corrigé après coup (cinq vidéos supprimées : `Ugg_Mad_2`, `InstaGilHorizontal`, `BeautyProject/*` ×3) ; son ancien hash était `de75834`.

### Lot 4, partie A — Grille et images

| Commit | Objet |
|---|---|
| `581e3ea` | Grille rendue côté serveur ; ratios lus dans l'URL des assets Storyblok |
| `658ba8a` | Lightbox servie par le service d'images Storyblok ; `eslint-disable` retiré |
| `b00ceb6` | Débordement horizontal de la grille corrigé |
| `8cc9528` | Lightbox : netteté sur écran Retina (qualité WebP 90, `sizes` adapté, largeurs 1600/2560/3200) |

**Principe de la grille.** Le placement (« colonne la plus courte d'abord ») dépend de la largeur du conteneur. Le serveur le calcule pour toutes les largeurs de 200 à 4000 px, regroupe les largeurs qui donnent le même placement (24 variantes avec le contenu actuel) et écrit, dans le HTML, une seule liste de vignettes avec une feuille de style qui choisit le placement par requête de conteneur (`lib/masonry.ts`). Les vignettes et leurs images sont dans le HTML ; rien ne bouge à l'hydratation. Dès qu'un ratio mesuré dans le navigateur change (vidéos), le calcul exact en pixels, identique à l'ancien, reprend la main.

**Preuves** (Chrome sans interface, build de production local, mobile 390 px, tablette 834 px, ordinateur 1440 px) :

| Vérification | Résultat |
|---|---|
| Colonnes et ordre des 77 vignettes, avant/après, une fois tout chargé | identiques aux trois largeurs |
| Placement servi par le HTML + CSS seuls (JavaScript bloqué) comparé à l'algorithme, 88 largeurs de 320 à 3840 px, seuils compris | 0 écart |
| Hauteur des vignettes | à 1 px près (le ratio vient de l'URL et non de l'image redimensionnée, arrondie) ; hauteur totale de la grille +0,1 % (7496 → 7505, 7214 → 7225, 7073 → 7080 px) |
| Largeur des colonnes | fractionnaire (à moins de 1 px de l'ancienne largeur arrondie) |
| Console du navigateur | 0 erreur, 0 avertissement (pas d'écart d'hydratation) |
| Poids de la home | HTML 648 Ko (52 Ko compressé) contre 271 Ko, 65 balises img dans le HTML contre 1 |

**Poids des images** (réseau, cache désactivé ; « ouverture » = 6 s après le chargement, sans défilement). Home : 508 → 329 Ko (mobile), 1 414 → 910 Ko (tablette), 589 → 367 Ko (ordinateur 1x). Après défilement complet, le poids des vignettes est inchangé (même optimiseur d'images).

**Lightbox** : 5 images chargées à l'ouverture d'un album (image courante et deux voisines de chaque côté). Avant : les originaux, 32,7 Mo dans tous les cas. Après (WebP qualité 90, largeur choisie par le navigateur selon la taille d'affichage et `devicePixelRatio`) :

| Écran | Largeur demandée | Poids des 5 images | Pixels livrés / pixels d'écran |
|---|---|---|---|
| Mobile 390 px, 2x | 750 | 0,49 Mo | 1,15 |
| Tablette 834 px, 2x | 1600 | 3,1 Mo | 1,04 |
| Ordinateur 1440 px, 1x | 640 (portrait) ou 1080 | 0,52 Mo | 1,09 |
| Ordinateur 1440 px, Retina 2x | 1080 (portrait) ou 2048 | 2,2 Mo | 1,03 |
| Grand écran 1920 px, 2x | 1600 ou 2560 | 4,7 Mo | 1,05 |

Qualité : une première version (WebP 80) donnait 0,27 Mo sur ordinateur 1x mais lissait le grain des photos (SSIM 0,91 contre un plafond de 0,99 dû au rééchantillonnage ; 0,96 à qualité 90, 0,98 à 95 pour +44 % de poids). Elle affichait en outre l'image à 72 % de sa taille sur écran Retina (corrigé). La qualité est la constante `DEFAULT_QUALITY` de `lib/storyblok-image.ts` si vous voulez 95.

Poids du HTML de la home (`/`) : 271 Ko brut / 20 Ko gzip avant ; 679 Ko brut / 52,5 Ko gzip après. CSS externe : 25,8 Ko brut / 6,6 Ko gzip, inchangé. Nouveau `<style>` dans le HTML (placements) : 14 Ko brut / 2,3 Ko gzip ; variables de placement dans les 77 vignettes : 56,6 Ko brut / 12,7 Ko gzip. Hors de la plage 200–4000 px de largeur de conteneur : la plus petite plage s'applique à toute largeur inférieure (2 colonnes, placement calculé à 200 px) et la plus grande à toute largeur supérieure (4 colonnes, placement calculé à 4000 px). Au-dessus de 4000 : 0 écart avec l'algorithme exact testé jusqu'à 10 000 px ; au-dessous de 200 px (aucun appareil réel : le plus petit mobile fait 304 px de conteneur), le placement diffère de l'exact pour la plupart des largeurs, sans casser l'affichage.

**Débordement horizontal.** Reproduit avec des barres de défilement de 15 px : défilement horizontal de 8 px et grille décalée de 7,5 px à gauche. Corrigé (largeur de la grille = fenêtre moins la barre, mesurée par un script dans `<head>`) : plus de débordement, grille de 0 à la largeur visible. Sans effet avec les barres « overlay » (macOS, mobiles).

**Constats de la partie A.**
- **Une image a des dimensions fausses dans son URL** : `doc156_v2.jpg` (URL 2894×1060, soit 2,73 ; fichier réel 3,05). Le code compare le ratio de l'URL à l'image chargée et prend la mesure si l'écart dépasse 3 %, donc l'affichage reste celui d'aujourd'hui ; seul cet élément se replace après son chargement. Ré-importer cette image dans Storyblok supprime ce cas.
- **Les 12 vidéos de la grille ont un ratio « auto » et ne sont pas des assets Storyblok** (fichiers sur Cloudflare R2 ou `/videos`) : leurs dimensions ne sont connues qu'au chargement de leurs métadonnées, comme avant. Elles restent donc la seule source de réorganisation de la grille (une fois la vidéo vue). Renseigner le champ « Ratio » de ces blocs `video_item` dans Storyblok la supprimerait (action de votre côté).
- **Champ « Ratio » de `media_item`** : valeur `auto` sur les 91 blocs, aucun effet. Avis : le supprimer du schéma (le faire fonctionner recadrerait les photos à un ratio imposé, donc changerait l'ordre et l'apparence). Non touché, décision à vous. Le champ « Ratio » de `video_item`, lui, est utile.
- Les premières vignettes (4) sont chargées sans attendre (`priority`) ; les autres restent paresseuses.

## 3. Décisions prises

1. **Webhook par secret d'URL.** Le plan Storyblok gratuit n'offre ni « Webhook secret » ni en-têtes personnalisés ; la vérification de signature (`91adacb`) a donc été remplacée (`63c6943`). Conservés : POST uniquement, comparaison en temps constant, variable `STORYBLOK_WEBHOOK_SECRET`, réchauffement de la home. Limite assumée : le secret peut apparaître dans des journaux d'accès ; l'enjeu reste faible (il permet seulement de déclencher une régénération). En cas de doute, le changer dans Vercel puis dans l'URL du webhook.
2. **Storyblok signe l'aperçu avec le premier jeton preview de l'espace**, pas avec le plus récent (constat fait sur la preview Vercel : avec le nouveau jeton, 404 ; avec l'ancien, l'aperçu fonctionne). Le code est correct. `STORYBLOK_PREVIEW_TOKEN` doit donc contenir le jeton qui signe, et l'ancien jeton doit être supprimé de l'espace à la mise en production pour que le nouveau prenne le relais (documenté dans `.env.example`).
3. **`aalbum_photos` est une donnée orpheline hors schéma** (l'ancien champ a été renommé `album_photos`). Rien à faire dans le code ; 36 blocs `media_item` du contenu en portent encore. Le nettoyage éventuel dans Storyblok vous appartient.
4. **Le champ « Ratio » de `media_item` n'a aucun effet** sur l'affichage : le code ne le lit pas (seuls les blocs vidéo utilisent un ratio forcé). Non touché, ni le champ ni la grille : traité au lot 4.
5. **Aperçu de l'éditeur** : la requête `/?_storyblok=…` est réécrite vers `/storyblok-preview`, seule route dynamique, pour garder la home publique statique.
6. **Contenu publié en développement** : `/` affiche le publié ; le brouillon se voit via l'aperçu signé.
7. **DOMPurify abandonné** : le texte riche est rendu par `StoryblokRichText` (le texte est échappé, les liens `javascript:` sont bloqués).
8. **Mode sombre supprimé** plutôt qu'implémenté.
9. **`media_item` hors grille retiré, `hero_full_bleed` conservé** : la vignette autonome avait une taille fixe 1600×1200 et aucune lightbox (réparer demandait des choix de conception) ; le hero se répare simplement. Les blocs `media_item` imbriqués dans `grid_masonry` ne sont pas concernés. Il ne faut pas placer un `media_item` directement dans le corps d'une page.

## 4. Corrections et constats postérieurs au rapport initial

- **Vidéos** : le rapport donnait sept vidéos inutilisées (~28 Mo). **Deux sont utilisées** par la home via des blocs `video_item` du contenu Storyblok : `GA_IG_POST01.mp4` et `InstaGil.mp4`. Elles sont conservées. Cinq ont été supprimées. Un lien externe vers l'un des fichiers supprimés ne peut pas être exclu.
- **`any`** : 16 et non 15, bloquants pour le lint.
- **Edge Config** : le projet Vercel `gil` n'a jamais eu `EDGE_CONFIG`, `EDGE_CONFIG_ID` ni `VERCEL_TOKEN` ; le mécanisme ne tournait pas en production.
- **Optimiseur d'images (Next ≥ 16.3.0)** : il refuse de charger les images Storyblok lorsque le DNS résout `a.storyblok.com` vers des adresses NAT64 (`64:ff9b::…`), classées « privées ». Observé sur la machine de développement. Sans effet sur Vercel (la preview affichait les images). Si vous le voyez en local : `images.dangerouslyAllowLocalIP` en développement seulement. Non ajouté (décision vous revient).
- **Compte Vercel** : plus bloqué au 2026-11-16 (blocage `FAIR_USE_LIMITS_EXCEEDED` levé).
- **`.vercel/project.json` local** pointe vers `anselmi` (projet vide) au lieu de `gil`.
- **`NEXT_PUBLIC_STORYBLOK_VERSION`** existe sur Vercel mais n'est plus lue par le code.
- **Home non présente dans le HTML serveur** : la grille était construite côté navigateur. Corrigé en 4A (la grille est maintenant dans le HTML).

## 5. Lot 4 — partie B à faire

Partie A faite (voir § 2). Contenu prévu de la partie B :

- `focus-visible` sur les vignettes (`ZoomableImage`, `ZoomableVideo`, `ZoomableVimeo`).
- `alt` issus du CMS (hero, diptyque, vignettes Vimeo, pixel transparent des diapositives vidéo).
- Taille du texte de navigation (9 px sur mobile).
- Balises `<main>` imbriquées (`error.tsx`, `not-found.tsx`) et niveaux de titres (`/information`).
- `app/sitemap.ts`, `app/robots.ts`, attribut `lang` cohérent avec le contenu (`lang="fr"` pour un contenu en anglais).
- Factorisation de la conversion des albums (aujourd'hui dans `GridMasonry`) et des types `Item` (déclarés dans `MasonryColumns` et `GalleryContext`).

## 6. Points du rapport initial non planifiés

À décider (aucun n'est prévu dans un lot) :

| Point | Fichier | Remarque |
|---|---|---|
| `/api/ping` | `app/api/ping/route.ts` | Conservée : un moniteur externe l'utilise peut-être |
| Vidéos de `/information` et `/mentions-legales` | `app/information/page.tsx`, `app/mentions-legales/page.tsx` | 5-6 Mo en lecture automatique, sans poster, mise en page copiée-collée |
| Politique CSP incomplète | `next.config.ts` | Seul `frame-ancestors` est défini |
| Police Big Caslon en `.otf` | `app/fonts/` | À convertir en `.woff2` ; `--font-sans` jamais définie |
| Miniatures Vimeo | `ZoomableVimeo.tsx` | Dépendent du service tiers `vumbnail.com` |
| `GalleryProvider` | `GalleryContext.tsx` | `useState(items)` fige la liste |
| Notes à la racine | dix fichiers `.md`, `.gitignore` | La ligne `.md` n'ignore rien |
| `ignoreDeprecations` | `tsconfig.json` | Masque des avertissements TypeScript |
| Tests et intégration continue | — | Aucun ; au minimum typecheck et build en CI |
| Dépendances Storyblok | `package.json` | `@storyblok/react` 5 → 7 : seule montée risquée ; les avis restants (`markdown-it`, `linkify-it`) en dépendent |
| Clé privée dans l'historique git | commits `52368ee`, `9239e66` | `localhost-key.pem` (certificat local, risque faible) : régénérer le certificat |

## 7. À faire de votre côté pour la mise en production

Ne pas supprimer les variables ou jetons avant d'avoir déployé : la version actuellement en production lit encore `NEXT_PUBLIC_STORYBLOK_TOKEN` et `REVALIDATE_SECRET`.

### Avant le déploiement

1. Storyblok → Settings → Access Tokens : créer le nouveau jeton « Preview » s'il n'existe pas déjà. **Ne pas supprimer l'ancien.**
2. Vercel (projet `gil`) → Environment Variables, **pour Production et Preview** :
   - `STORYBLOK_PREVIEW_TOKEN` : le nouveau jeton (la variable existe déjà ; vérifier sa valeur) ;
   - `STORYBLOK_WEBHOOK_SECRET` : secret aléatoire (`openssl rand -hex 32`), différent de l'ancien `REVALIDATE_SECRET`.
3. En local (`.env.local`) : `STORYBLOK_PREVIEW_TOKEN` renseigné, `NEXT_PUBLIC_STORYBLOK_TOKEN` retiré.
4. Décider de la fusion de `fix/audit` dans `main` (aujourd'hui : après le lot 4, ou par lots).

### Déploiement

À votre main : rien n'a été poussé.

### Juste après le déploiement

5. Storyblok → Settings → Webhooks : URL `https://gilanselmi.com/api/revalidate?secret=<STORYBLOK_WEBHOOK_SECRET>`. Entre le déploiement et ce changement, les publications ne rafraîchissent pas le site (l'ancien secret est refusé).
6. Tester : publier une modification et recharger la home ; ouvrir l'éditeur visuel (aperçu, clic sur un bloc, édition en direct) ; vérifier que `/?_storyblok=1` renvoie 404 en accès public ; vérifier l'affichage des images et des vidéos.

### Une fois les tests concluants

7. Storyblok → Access Tokens : **supprimer l'ancien jeton.** Le nouveau devient le premier jeton preview et prend le relais pour la signature de l'aperçu. Conséquences : l'éditeur visuel affiche une 404 entre le déploiement et cette suppression, et les anciens déploiements Vercel (retours arrière compris) cessent de lire le contenu.
8. Vercel → supprimer `NEXT_PUBLIC_STORYBLOK_TOKEN`, `REVALIDATE_SECRET` et `NEXT_PUBLIC_STORYBLOK_VERSION`.
9. Vercel : s'il existe un store Edge Config (Storage) ou un jeton d'accès Vercel créé pour `VERCEL_TOKEN`, les supprimer ou les révoquer (non vérifiable depuis le code).
10. Local : `vercel link` vers le projet `gil` si vous utilisez la CLI Vercel depuis ce dossier.

Variables à conserver : `STORYBLOK_PREVIEW_TOKEN`, `STORYBLOK_WEBHOOK_SECRET`.

### À surveiller

- Si le webhook répond 401 : vérifier que le secret de l'URL est identique à celui de Vercel et qu'un déploiement a eu lieu après la création de la variable.
- Si l'aperçu de l'éditeur répond 404 : le jeton de `STORYBLOK_PREVIEW_TOKEN` n'est pas celui avec lequel Storyblok signe (voir décision 2) ; recharger l'éditeur si la page est restée ouverte plus d'une heure.
- L'année du pied de page se met à jour dans le navigateur ; aucun déploiement n'est nécessaire en janvier.
- Après une publication, le premier visiteur peut voir l'ancienne version si le réchauffement échoue ; le suivant voit la nouvelle.

## 8. Limites de l'audit

- Le comportement sur Vercel (cache, réchauffement, réécriture) a été testé par vos soins sur une preview ; je ne l'ai pas vérifié moi-même.
- Les signatures Storyblok ont été testées avec des valeurs calculées en local selon la documentation, et validées par vos tests sur la preview.
- Le contenu Storyblok a été lu via l'API de lecture (stories `home` et `contact`) ; la configuration de l'espace (schémas des blocs, plan, webhooks) n'a pas été consultée.
- Aucun score de performance réel n'a été mesuré (Lighthouse, Core Web Vitals).

## 9. Journal des mises à jour

| Date | Mise à jour |
|---|---|
| 2026-11-16 | Création du document ; lots 0 à 3 documentés ; lot 4 listé |
| 2026-11-16 | Lot 4, partie A : grille rendue côté serveur, lightbox via Storyblok, débordement corrigé |
