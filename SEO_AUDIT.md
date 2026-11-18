# SEO_AUDIT.md — gilanselmi.com

Audit du 2026-11-18 (branche `seo/audit`). Lecture seule : aucun fichier du site modifié.
Objectif : se positionner sur « photographe de mode » (et photographe éditorial / beauté / campagnes, Paris).
Méthode : 4 angles (technique, contenu, performance, données structurées) croisés code + production, puis fusion et dédoublonnage.
Limite : PageSpeed API en 429, donc **aucune mesure réelle de LCP/INP/CLS** ; les constats perf sont statiques + tailles de transfert.

## Décision préalable : langue et positionnement

La cible est « photographe de mode » (FR) alors que le site est 100 % anglais. Cette décision conditionne #1, #2, #3 et #6 : à trancher **avant** d'écrire le moindre texte. Options : EN seul avec « fashion photographer Paris » ; EN + mots-clés FR dans la description ; version `/fr` avec hreflang. Le mot « mode/fashion » n'apparaît aujourd'hui nulle part dans le texte du site.

## Diagnostic en une phrase

La base technique est saine (https, www→apex, 404 réels, sitemap/robots corrects, SSR). Le problème est ailleurs : **le site n'envoie presque aucun signal textuel** à Google (0 titre Hn sur la home, ~1 seul `<p>`, 0 JSON-LD, mot « mode/fashion » absent de toutes les balises) et ne compte que **2 pages indexables**, les projets étant des `<button>` qui ouvrent une lightbox.

## Tableau priorisé

| # | Priorité | Constat | Correction | Effort | Fichiers |
|---|---|---|---|---|---|
| 1 | **Fort** | Home sans aucun h1–h6 et sans texte indexable (seuls signaux : alt, title, description) | Ajouter un h1 (`sr-only` acceptable, un intro visible de 2–3 phrases est mieux) + un h2 par catégorie (Fashion, Beauty, Editorial, Campaigns, Film) | S | `storyblok/Home.tsx`, `app/page.tsx` |
| 2 | **Fort** | Title/description sans mot-clé : « Gil Anselmi — Photographer » / « Portfolio of Gil Anselmi — photographer & film. » (46 car.). Ni « fashion », ni « beauty », ni « Paris » (sauf /information) | Title ≈ 55 car. avec fashion + Paris ; description 140–155 car. (spécialités + clients publics). **Décision préalable : langue cible FR/EN** (voir « Décisions ») | S | `app/layout.tsx:8-9,12-13`, `app/information/page.tsx:4-5` |
| 3 | Moyen (impact classement faible ; à faire quand même, même fichier que #2) | Aucun JSON-LD sur tout le site | `@graph` Person + WebSite dans le layout (jobTitle, `homeLocation` Paris, `sameAs`, `image`), ProfilePage sur /information. Échapper `<` à la sérialisation. Pas de LocalBusiness : pas de NAP public | S–M | `app/layout.tsx`, `app/information/page.tsx` |
| 4 | **Fort** | Projets non crawlables : 65 vignettes = `<button>` + lightbox JS, 4 liens `<a>` sur tout le site, ~500 photos d'album uniquement dans le payload RSC. Google ne voit que 2 pages et les vignettes de couverture | Une page par projet/série (`/work/<slug>`) : h1, 50–100 mots (client, date, rôle, crédits), galerie en `<img>` avec alt, lien `<a>` depuis la home, ajout au sitemap. Nouveau type de contenu Storyblok + routage | **L** | `app/components/ZoomableImage.tsx:55`, `app/components/ZoomableVimeo.tsx:44`, `app/sitemap.ts`, Storyblok |
| 5 | Moyen (perf, **non mesuré** : Lighthouse non lancé, PSI en 429 ; `preload="none"` limite l'impact) | Vidéos de la grille : 11 fichiers R2 de 1,3 à 21,7 Mo (≈ 70 Mo, surtout `.mov`), lues dès qu'elles approchent du viewport, `poster=""` sur 12/13, `.mov` déclarés `video/mp4` | Réencoder les aperçus (H.264 .mp4, sans audio, ≤ 720 px, 0,3–1 Mo, faststart), affiche WebP par vidéo, renseigner Ratio, limiter la lecture simultanée. Garder l'original pour la lightbox | M | `app/components/ZoomableVideo.tsx:60-85,121`, bucket R2, Storyblok |
| 6 | **Fort** (l'une des 2 seules pages indexables, seul endroit où du texte existe) | /information maigre (~50 mots), pas de spécialités/clients/parutions ; libellé incohérent (« photographer and director » vs « photographer & film » sur le reste du site) | Étoffer à 150–300 mots : spécialités, clients, presse, Paris, disponibilité internationale ; harmoniser le libellé | S–M | `app/information/page.tsx:17-29` |
| 7 | Moyen | OG des sous-pages incomplet : `openGraph` de la page écrase celui du layout → pas d'og:image/siteName/type, `twitter:card=summary` | Répéter `images`, `siteName`, `type` (helper partagé) ; `summary_large_image` | S | `app/information/page.tsx:7-11`, `app/layout.tsx` |
| 8 | Moyen | og.jpg : dimensions déclarées 1200×630, réelles 1899×1200 (ratio 1,58) ; pas d'`alt` ; ni `og:type` ni `og:locale` | Recadrer en 1200×630 ou déclarer 1899×1200 ; ajouter `alt`, `type:'website'`, `locale` | S | `app/layout.tsx:16`, `public/og.jpg` |
| 9 | Moyen | Favicon : `favicon.ico` est un PNG 1600×1600 de 216 Ko déclaré `image/x-icon` ; pas d'apple-touch-icon, d'icon.svg, de manifest, de theme-color | `favicon.ico` 16/32/48, `icon.png`, `apple-icon.png` (180), `manifest.ts`, `themeColor` clair/sombre | S | `app/favicon.ico`, `app/` |
| 10 | Moyen | Pages 404 : balises robots contradictoires (`noindex` + `index, follow`) et canonical vers la home, hérités du layout (`:18-19`). Statut HTTP correct (404 vérifié, pas de soft-404) | `metadata` dans `not-found.tsx` (`robots:{index:false}`, pas de canonical) ou sortir canonical/robots du layout racine | S | `app/layout.tsx:18-19`, `app/not-found.tsx` |
| 11 | Moyen (**prérequis de #4**) | Canonical codé en dur sur `/` dans le layout (`:18`) : toute future page sans `alternates` (dont les pages projet du #4) se déclarerait canonique de la home | Canonical par page, ou `alternates:{canonical:'./'}` | S | `app/layout.tsx:18-19` |
| 12 | Moyen | Alt de qualité inégale : titres au lieu de descriptions, répétitions (« Merrma » ×6…), espaces finaux, MAJUSCULES, « Gil Anselmi » répété ; assets Storyblok et ~500 photos d'album sans alt | Modèle « [client] — [fashion editorial/beauty/campaign], [sujet] » ; nettoyer dans Storyblok. Travail éditorial, pas de code | S (éditorial) | `lib/gallery-items.ts:62,92,119`, Storyblok |
| 13 | Moyen (perf) | HTML home 689 Ko (43 Ko brotli) dont ~265 Ko de payload RSC : albums complets sérialisés vers le client alors qu'utiles seulement à la lightbox | Ne passer au client que les champs de vignette ; albums à la demande | M | `app/components/MasonryColumns.tsx`, `lib/gallery-items.ts`, `storyblok/Home.tsx` (pas de fichier GalleryProvider) |
| 14 | Moyen (perf) | 5 preloads d'images sans `fetchpriority` : le logo (PNG 337 Ko source) concurrence l'image LCP | `fetchPriority="high"` sur la 1ʳᵉ vignette seulement ; déclasser/alléger le logo | S | `app/components/MasonryColumns.tsx:86`, `public/logofi.png` |
| 15 | Faible (perf) | Hôte R2 `*.r2.dev` (domaine de dev, sans CDN dédié, sans Cache-Control) pour les vidéos | Domaine personnalisé (`media.…`) + `Cache-Control: immutable` | S | Cloudflare R2 |
| 16 | Faible (perf) | Polices : 3 fichiers préchargés (~93 Ko) ; Libre Caslon 700 probablement inutilisé | Retirer le poids 700 si non utilisé ; subset Big Caslon **après** règlement de la licence (déjà décidé dans AUDIT.md) | S | `app/layout.tsx:22-26` |
| 17 | Faible | Attribut `lang` : /mentions-legales en `lang="en"` sur `<html>` (contenu FR), `not-found` en `lang="fr"` sur un div | Cohérence selon la décision de langue (#2) ; `lang` local déjà posé | S | `app/mentions-legales/page.tsx:16`, `app/not-found.tsx:6` |
| 18 | Faible | Sitemap sans `lastModified` | `lastModified` (publication Storyblok / date de build) ; changefreq/priority inutiles | S | `app/sitemap.ts:7` |
| 19 | Faible | Doublon `<meta name="viewport">` (Next + ligne en dur) | Supprimer la ligne manuelle, utiliser `export const viewport` | S | `app/layout.tsx:34` |
| 20 | Faible | `http://www.` → 2 sauts (308 puis 308) | Rediriger www → apex directement dans Vercel Domains | S | Vercel |
| 21 | Faible (perf) | AVIF non activé (WebP seul) ; 18 largeurs de srcset dont 3200/3840 inutiles | `formats:['image/avif','image/webp']`, réduire `deviceSizes` ; **valider le coût Vercel** (AUDIT.md §3 n°10) | S | `next.config.ts` |
| 22 | Faible (perf) | Lightbox chargée au premier rendu ; module `noModule` 41 Ko | `next/dynamic` pour la lightbox ; mesurer avant | M | `app/components/MasonryColumns.tsx` |
| 23 | Faible | `Disallow: /storyblok-preview` + `noindex` dans la page (jamais lu) ; `.DS_Store` possiblement servi depuis `public/` | Aucun effet réel ; supprimer `.DS_Store` + `.gitignore` | S | `app/robots.ts:6`, `public/` |
| 24 | Faible | LocalBusiness / BreadcrumbList / ImageObject | Ne pas ajouter maintenant (pas de NAP, 2 pages). ImageObject utile avec les pages projet (#4) si crédits dans Storyblok | M | — |

## Vérifié OK (sans action)

https forcé ; www→apex ; trailing slash (308) ; 404 réels (`/contact`, `/zzz-nope`, `/index.html`, `/INFORMATION` — re-testés) ; aucun `X-Robots-Tag` ; sitemap (2 URLs canoniques, déclaré dans robots) ; `/mentions-legales` en noindex voulu ; titles/descriptions uniques par page ; home prérendue avec 65 `<img>` et alt dans le HTML initial ; assets `immutable` ; vignettes en WebP avec `sizes` ; 4 vignettes préchargées ; vidéo /information déjà réencodée ; /api/ping statique.

## Constat écarté

Un sous-agent signalait `/contact` servi en 200 avec le canonical de la home. **Faux** : re-testé, 404. Seules les balises contradictoires sur les pages 404 (#10) subsistent.

## Décisions à prendre (hors code)

1. **Langue cible** : voir « Décision préalable » en tête.
2. **Positionnement** : le mot « mode/fashion » n'apparaît nulle part dans le texte du site ; à valider avec Gil avant de l'écrire (spécialités, clients citables).
3. **Profils `sameAs`** : seul Instagram est connu (lien dans la navigation de toutes les pages, `app/Navbar.tsx:46`). Autres profils (Vimeo, LinkedIn, IMDb…) ?
4. **Google Business Profile / adresse** : l'adresse (Pantin) n'est que dans une page noindex. À publier ou non.

## 5 actions à faire en premier

1. **Obtenir la décision langue + positionnement « mode »** (avec Gil) : sans elle, on écrit les mauvais textes.
2. **Home : h1 + intro visible + title/description** (#1, #2). Un h1 `sr-only` ne doit pas être le seul porteur de mots-clés : prévoir du texte visible.
3. **Une passe métadonnées dans le layout** (#3, #7, #8, #10, #11) : JSON-LD, OG des sous-pages et dimensions de l'image, balises des 404, canonical par page. Effort S, un seul fichier principal.
4. **Étoffer /information** (#6) : spécialités, clients, presse, Paris, 150–300 mots.
5. **Cadrer les pages projet** (#4) : le plus gros levier pour se positionner sur « photographe de mode » et les noms de clients ; effort L (type de contenu Storyblok + routage + sitemap), à chiffrer avant de lancer.

Mesure à faire avant les chantiers perf (#5, #13, #14) : Lighthouse mobile local ou PageSpeed avec clé, car aucun CWV réel n'a été obtenu.


## Suivi des corrections (2026-11-18)

Contraintes : site en anglais (requête « fashion photographer Paris »), aucun texte visible ajouté/modifié, zéro changement visuel. Vérification : build de référence sur l'arbre propre comparé au build final. Diff du `<body>` : seul ajout visible = le `h1` masqué ; l'attribut `fetchPriority` sur une image ; les noms de classe générés par `useId` de la grille (`mgRlflb` → `mgR35flb`, renommés de façon cohérente dans leur propre CSS). Diff du CSS : seule la règle `.sr-only` est ajoutée. Build : OK. Rien n'est commité.

### Fait
_Preuves : diff complet `<head>` et `<body>` des 4 pages construites vs build de référence (title/description identiques à l'octet ; nombre de préchargements d'images inchangé ; la home n'a que ce `h1`, aucun `h2`-`h6` : aucun intitulé de catégorie n'est affiché, donc rien à convertir) ; les noms de classe de la grille viennent de `useId` (`app/components/MasonryColumns.tsx:89`) ; les légendes sont dans un `<button>` (`app/components/ZoomableImage.tsx:56`, `HoverCover` ligne 84) ; favicon 48 px et `icon.png` ouverts : même disque noir à étoile blanche. « Identique au pixel près » repose sur l'identité du HTML et du CSS construits, **sans capture d'écran comparée**. `fetchPriority="high"` apparaît 2 fois sur la home : l'image et son `<link rel="preload">`. Le JSON-LD est émis sur toutes les pages (y compris /mentions-legales et la 404), car il est dans le layout._

- [x] **#1** — un `h1` `sr-only` en premier enfant de `storyblok/Home.tsx` : « Gil Anselmi — Photographer » (libellé déjà présent sur le site ; la version avec « fashion » sera validée par la cliente avec le title). Transformer un élément affiché en titre était impossible sans changer son style : `app/globals.css:9-20` impose aux h1/h2 `font-serif`, `text-5xl`/`text-3xl` ; les légendes de vignette sont dans des `<button>` ; le logo est partagé avec des pages qui ont déjà leur h1.
- [x] **#3** — JSON-LD `WebSite` + `Person` dans le `<head>` de `app/layout.tsx` (faits déjà publiés : Paris, « photographer and director », e-mail de /information, Instagram du menu). Pas de ProfilePage.
- [x] **#7** — `openGraph` de `/information` : `images`, `siteName`, `type` (donc `summary_large_image`). `/mentions-legales` non traité (noindex).
- [x] **#8** — dimensions déclarées corrigées en 1899×1200 (image non recadrée) ; `alt`, `og:type`, `og:locale` ajoutés.
- [x] **#9 (partiel)** — `favicon.ico` : vrai ICO 48×48 (9,8 Ko au lieu de 216 Ko) ; `app/icon.png` 512×512 ; `app/manifest.ts` (sans couleurs).
- [x] **#10** — la 404 n'a plus qu'un `robots` (`noindex`) et plus de canonical (balises du layout retirées).
- [x] **#11** — canonical sorti du layout ; la home le déclare dans `app/page.tsx` (valeur inchangée), `/information` et `/mentions-legales` gardaient le leur.
- [x] **#14 (partiel)** — `fetchPriority="high"` sur la seule première vignette image (l'image et son `<link rel=preload>`). `priority` du logo conservé.
- [x] **#18 (partiel)** — `lastmod` de `/` = `published_at` de la story Storyblok (2026-11-16 au build), sans pouvoir faire échouer le build ; `/information` sans date (aucune source fiable).
- [x] **#19** — `export const viewport` ; le doublon est supprimé, même contenu (`width=device-width, initial-scale=1, viewport-fit=cover`).

### Volontairement non fait
- [ ] **#16** — le poids 700 **est utilisé** : `globals.css:9-12` met h1–h3 en `font-serif` (Libre Caslon) et `app/mentions-legales/page.tsx:17,21,43,57,72` applique `font-bold`/`font-semibold` à ses h1/h2.
- [ ] **#17** — `<html lang>` par page exige plusieurs layouts racine (changement de structure) ; `lang="fr"` local déjà posé sur le contenu des mentions légales.
- [ ] **#23** — `curl -sI https://gilanselmi.com/.DS_Store` et `/dogs/.DS_Store` : 404 en prod, fichiers ignorés par `.gitignore` et non suivis par git. Rien à faire, rien supprimé.

### Livrables sans modification du site
- [x] **#2** — `SEO_PROPOSALS.md` : 3 titles et 3 descriptions (home et /information), rien appliqué.
- [x] **#12** — `ALT_PROPOSALS.md` : 64 vignettes (la 65ᵉ `<img>` est le logo), 2 lignes « [à compléter : client] » (n°25 et 34), 6 alt de 130–135 caractères (n°18, 32, 47, 51, 52, 61), doublons de fichier signalés (n°12/41, 16/27). Contrôle : 5 images rouvertes (n°1, 20, 24, 33, 50) ; 2 corrections apportées (n°33 décrit à tort deux vestes, n°20 le logo « courrèges » est lisible). Les 59 autres lignes n'ont pas été relues image par image.

### Hors périmètre (non traités)
#4, #5, #6, #13, #15, #20, #21, #22, #24.

### Décisions requises
- ~~Texte du `h1` masqué~~ — décidé : « Gil Anselmi — Photographer » ; la version avec « fashion » reste à faire valider par la cliente avec le title (SEO_PROPOSALS.md).
- ~~`apple-icon.png`~~ — décidé : non créé.
- ~~`theme-color` / couleurs du manifest~~ — décidé : non posés.
- ~~#14 logo~~ — décidé : `priority` laissé tel quel.
- ~~#7 `/mentions-legales`~~ — décidé : pas d'`og:image`.
- Décidé : JSON-LD conservé sur toutes les pages.
