# Vidéos sur Cloudflare R2 — note technique

Branche `feat/videos-r2`, 2026-11-23. Ce document remplace les anciens guides Cloudinary et Vimeo de `docs/` (`GUIDE_VIDEOS_CLOUDINARY_ALBUMS.md`, `SETUP_HYBRIDE_CLOUDINARY_VIMEO.md`, etc.), désormais obsolètes.

## Principe

- **Hébergement** : bucket R2, en juridiction **UE**, et compte Cloudflare au nom du développeur. La cliente n'ouvre jamais Cloudflare.
- **Envoi** : page privée `/admin/videos`, protégée par mot de passe, en `noindex` (balise et en-tête `X-Robots-Tag`), absente du plan du site.
  - Le navigateur envoie le fichier **directement à R2**, par une URL présignée valable 15 min.
  - Les clés R2 ne quittent jamais le serveur.
- **Nom des fichiers** : `uploads/<nom-nettoyé>-<suffixe aléatoire>-<largeur>x<hauteur>.mp4`.
  - L'affiche (première image, JPEG de 720 px de large au plus) porte le même nom en `.jpg`.
  - Chaque fichier reçoit `Cache-Control: public, max-age=31536000, immutable` ; ce réglage est sûr parce que les noms sont uniques.
- **Grille** : pour une adresse de cette forme, `lib/gallery-items.ts` déduit le ratio et l'affiche. La cliente ne colle donc qu'un lien.
- **Garde-fou** : dans l'éditeur visuel Storyblok uniquement, un bandeau jaune signale toute vidéo, de la grille ou d'un album, qui ne vient pas de la page d'envoi (`app/components/EditorVideoWarning.tsx`).
- **Chargement** : une vidéo ne se charge qu'après 300 ms de visibilité à plus de 50 % (`ZoomableVideo.tsx`).

### Fichiers

| Fichier | Rôle |
|---|---|
| `lib/videos.ts` | Limites (40 Mo, 60 s), nommage, lecture des dimensions dans l'adresse |
| `lib/r2.ts` | Client S3 (`aws4fetch`), URL présignées, liste |
| `lib/admin-auth.ts`, `lib/admin-session.ts` | Mot de passe et cookie de session signé (HMAC, 30 jours) |
| `app/api/admin/*` | `login`, `logout`, `videos` (liste), `videos/presign` |
| `app/admin/videos/*` | Page, formulaire de connexion, envoi |
| `lib/video-compress.ts` | Préparation dans le navigateur (Mediabunny / WebCodecs), chargée par la seule page d'envoi |
| `scripts/reencode-videos.sh` | Réencodage ffmpeg des vidéos existantes |

### Variables d'environnement

Les noms sont documentés dans `.env.example`. Ne jamais y mettre de valeur.

| Variable | Remarque |
|---|---|
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Jeton « Object Read & Write » limité au bucket |
| `R2_BUCKET` | Nom du bucket |
| `R2_JURISDICTION` | `eu` : sans elle, l'API répond 403 (le bucket est en UE) |
| `VIDEOS_PUBLIC_BASE_URL` | `https://pub-….r2.dev` aujourd'hui, `https://videos.gilanselmi.com` après la bascule |
| `ADMIN_VIDEOS_PASSWORD` | Mot de passe de la cliente |
| `ADMIN_SESSION_SECRET` | Aléatoire, par exemple `openssl rand -hex 32` |

État le 2026-11-23 :
- les variables sont posées dans l'environnement **Preview** de Vercel ;
- **Production** n'est pas configurée : à faire à la mise en production ;
- en local, `.env.local` n'a pas encore `R2_JURISDICTION=eu` (les tests l'ont passée en ligne de commande).

## Compression dans le navigateur : ce qui a été mesuré

Les mesures portent sur les 13 vidéos du site et sur des échantillons (30 s de 4K HEVC, 60 i/s, ProRes, HDR HLG), dans Chrome 158 et Safari 26.5 sur un Mac M2.

| | Chrome | Safari |
|---|---|---|
| Encodeur H.264 | Profil High, mode « quantizer » (qualité constante) | Baseline imposé par Mediabunny, débit fixe, sans « quantizer » |
| Qualité (SSIM contre l'original réduit) | 0,984 à 0,991 | 0,957 à 0,975 |
| Temps (30 s de 4K HEVC) | moins de 6 s | 51 s |
| ProRes | non décodable | non décodable |

**Décision** : la page compresse seulement si le navigateur offre le mode « quantizer » (le test se fait sur la capacité du navigateur, pas sur son nom).
- Dans Safari, une vidéo déjà légère part telle quelle ; une vidéo à compresser renvoie vers Chrome.
- Sont refusés avec un message : ProRes et autres formats non décodables, HDR, plus de 60 s, plus de 40 Mo après compression.

**Règle de compression** :
- H.264 avec quantificateur 22, puis 26 si le débit dépasse 0,13 bit par pixel et par image (environ 8 Mbit/s en 1080×1920) ;
- petit côté ramené à 1 080 px, 30 images par seconde au plus ;
- audio : AAC copié, ou réencodé à 128 kbit/s ;
- un MP4 H.264 déjà léger part tel quel ; si l'original est plus léger que le résultat, l'original est gardé.

**Couleur** : Chrome étiquette en sRGB les images qu'il redimensionne, et Safari affiche alors la vidéo environ 10 niveaux plus sombre. La page corrige l'étiquette en BT.709 (boîte `colr` du MP4). Écart mesuré après correction : moins de 0,3 niveau dans les deux navigateurs.

## Vidéos existantes

**Sauvegardes** :
- originaux : `/Users/mikayay/Documents/Pro/anselmi-videos-sauvegarde-2026-11-23/` ;
- versions réencodées : `/Users/mikayay/Documents/Pro/anselmi-videos-reencodees-2026-11-23/`.

**Réencodage** : 80 Mo deviennent 25,6 Mo. L'image affichée reste à moins de 0,83 niveau sur 255 de l'original, dans Safari comme dans Chrome. `GA_IG_POST01` et `InstaGil` sont gardés tels quels, car réencodés ils grossissaient.

Les 13 vidéos ont été envoyées par la page le 2026-11-23. Leurs affiches pèsent 1,35 Mo au total.

### Table de migration (étape 6) : liens à coller dans Storyblok

Ces liens utilisent l'adresse `r2.dev` provisoire. Après la bascule du domaine, remplacer `https://pub-077dd9d9d31e445e93c96024bb4992c6.r2.dev` par `https://videos.gilanselmi.com`, ou copier les nouveaux liens depuis la page d'envoi.

| Bloc `video_item` (uid) | Place dans la grille | Fichier d'origine | Nouveau lien |
|---|---|---|---|
| eae3ba8d | items[5] | Pastel_Beauty_Project_001.mov | `…/uploads/pastel-beauty-project-001-6qmsyy-624x464.mp4` |
| 34eaef9c | items[7] | 0114.mov | `…/uploads/0114-t588s5-1080x1410.mp4` |
| a89b5a36 | items[13] | 1121_V4.mov | `…/uploads/1121-v4-8cls18-1080x1512.mp4` |
| 43f398cb | items[20] | Pastel_Beauty_Project_002.mp4 | `…/uploads/pastel-beauty-project-002-41lr9q-768x512.mp4` |
| 8535382a | items[33] | Pastel_Beauty_Project_006.mp4 | `…/uploads/pastel-beauty-project-006-3zb1pk-768x512.mp4` |
| c378c9d6 | items[44] | 0114 (1).mov | `…/uploads/0114-1-3ksywl-1080x1512.mp4` |
| e404e2ea | items[52] | 1121_V2.mov | `…/uploads/1121-v2-6knn3s-1080x1512.mp4` |
| 570f7b59 | items[63] | 1121_V5.mov | `…/uploads/1121-v5-trfdaz-1080x1512.mp4` |
| 9099b416 | items[71] | /videos/GA_IG_POST01.mp4 | `…/uploads/ga-ig-post01-812uyq-1920x1080.mp4` |
| e0bc6835 | items[78] | 1121_V6.mov | `…/uploads/1121-v6-fodeln-1080x1512.mp4` |
| 0cc723d9 | items[83] | /videos/InstaGil.mp4 | `…/uploads/instagil-rmc8us-720x720.mp4` |
| 9b87a515 | items[88] | 1121_V3.mov | `…/uploads/1121-v3-eccuxs-1080x1512.mp4` |
| ffe634e8 | items[95] | UGG_COMMERCIAL1025.mov | `…/uploads/ugg-commercial1025-f9ej0l-1920x1080.mp4` |
| bae9c3e2 | album « Luis De Javier », album_videos[1] | Pastel_Beauty_Project_001 (Cloudinary, perdu) | même lien que eae3ba8d (fichier probablement identique) |
| a442c04e | album « Luis De Javier », album_videos[0] | PullLetterMagazine_Miumiu_10s (Cloudinary, perdu) | **en attente de l'original** |

`InstaGil` avait le ratio forcé « 3:2 » alors que la vidéo est carrée. Le ratio lu dans le lien (720×720) prend le pas sur ce champ. L'affichage final ne change pas, puisque la grille mesurait déjà la vidéo : seul le saut au chargement disparaît.

## Migration sans interruption

Les anciennes adresses (`r2.dev/Smash (2)/…` et `/videos/…`) restent servies jusqu'à la dernière étape.

1. ~~Sauvegardes, réencodage, envoi des 13 vidéos~~ (fait le 2026-11-23).
2. Récupérer l'original « Miumiu 10s » et l'envoyer par la page.
3. Bascule DNS (liste ci-dessous), puis `VIDEOS_PUBLIC_BASE_URL=https://videos.gilanselmi.com`.
4. Fusion de `feat/videos-r2` et mise en production. Avant le déploiement, poser les variables de Production.
5. Dans Storyblok, remplacer les liens bloc par bloc (table ci-dessus, avec le domaine définitif), puis publier.
   - Le bandeau jaune de l'éditeur doit avoir disparu partout.
6. Vérifier la home publique, la lightbox et l'album ; aucune 404 dans la console.
7. Deux semaines sans 404 :
   - supprimer `public/videos/GA_IG_POST01.mp4` et `public/videos/InstaGil.mp4` du dépôt ;
   - supprimer les anciens objets `Smash (2)/` du bucket ;
   - désactiver l'adresse `r2.dev`.

## Bascule DNS : OVH puis Cloudflare, dans l'ordre

1. **Cloudflare** : ajouter `gilanselmi.com` en plan Free. Comparer un par un les enregistrements importés avec ceux d'OVH : MX, SPF, DKIM, TXT de Search Console, A `76.76.21.21`, CNAME vers Vercel.
2. **Cloudflare** : passer les enregistrements qui pointent vers Vercel en « DNS only » (nuage gris).
3. **OVH** : si DNSSEC est actif, le désactiver **avant** de changer de serveurs DNS. Sinon, panne.
4. **OVH** : baisser le TTL, puis attendre la durée de l'ancien TTL.
5. **OVH** : remplacer les serveurs DNS par les deux serveurs Cloudflare indiqués.
6. **Cloudflare** : attendre que la zone soit « Active », puis vérifier le site et l'e-mail.
7. **Cloudflare, R2** : brancher le domaine personnalisé `videos.gilanselmi.com` sur le bucket. Ajouter une règle de cache pour `*.mp4` et `*.jpg`.
8. **Cloudflare, R2, règle CORS** :
   - origines : `https://gilanselmi.com` ;
   - garder `http://localhost:3000` pour le développement, et les previews si besoin ;
   - méthodes : `PUT`, `GET`, `HEAD` ;
   - en-têtes : `content-type`, `cache-control`.
9. **Vercel** : définir `VIDEOS_PUBLIC_BASE_URL=https://videos.gilanselmi.com`, en Preview et en Production.

## Limites connues

- R2 ne permet pas de limiter la taille dans une URL présignée PUT. La limite de 40 Mo est vérifiée par l'API sur la taille annoncée ; l'accès reste réservé aux détenteurs du mot de passe.
- La page ne permet pas de supprimer une vidéo. Une suppression se fait dans Cloudflare, par le développeur.
- Le parcours dans Safari, côté interface, n'a pas été piloté automatiquement. Sa logique (détection, refus, envoi tel quel) a été testée dans le banc d'essai Safari.
- HDR : la détection de Mediabunny a manqué l'échantillon synthétique, d'où un contrôle supplémentaire sur `bt2020` / `pq` / `hlg`. Aucun fichier réel d'iPhone n'a été testé.
- La fiche HandBrake n'a pas été testée dans HandBrake.
