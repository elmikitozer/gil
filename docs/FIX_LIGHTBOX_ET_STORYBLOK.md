# ✅ Fix : Contrôles vidéo + Preview Storyblok

## 🎯 Problèmes résolus

### 1️⃣ Impossible de cliquer sur les contrôles vidéo dans la lightbox

**Avant :** Cliquer sur play/pause/timeline fermait la lightbox

**Solution :** Ajout de `onClick={(e) => e.stopPropagation()}` sur le conteneur vidéo

**Résultat :** Vous pouvez maintenant cliquer sur les contrôles sans fermer la lightbox ✅

---

### 2️⃣ Vidéos s'ouvrent en grand dans le preview Storyblok

**Avant :** Cliquer sur une vidéo dans le preview Storyblok ouvrait la lightbox

**Solution :** Détection de l'éditeur Storyblok avec `useIsStoryblokEditor()` et blocage de l'ouverture

**Résultat :** Dans Storyblok, cliquer sur une vidéo affiche juste les infos à droite, comme pour les images ✅

---

## 🔧 Modifications apportées

### Fichiers modifiés :

#### 1. `app/components/ui/gallery/Lightbox.tsx`

- Ajout de `onClick={(e) => e.stopPropagation()}` sur les conteneurs vidéo
- Empêche la fermeture de la lightbox quand on clique sur les contrôles

#### 2. `app/components/ZoomableVideo.tsx`

- Import de `useIsStoryblokEditor`
- Détection de l'éditeur Storyblok
- Blocage de l'ouverture de la lightbox si dans l'éditeur

#### 3. `app/components/ZoomableVimeo.tsx`

- Import de `useIsStoryblokEditor`
- Détection de l'éditeur Storyblok
- Blocage de l'ouverture de la lightbox si dans l'éditeur

---

## 🎬 Comportement final

### Sur votre site public :

✅ Clic sur vidéo → Lightbox s'ouvre
✅ Clic sur contrôles vidéo → Contrôles fonctionnent (play/pause/timeline)
✅ Clic en dehors de la vidéo → Lightbox se ferme
✅ Touche Escape → Lightbox se ferme

### Dans l'éditeur Storyblok :

✅ Clic sur vidéo → Sélectionne l'élément, affiche les infos à droite
✅ Pas d'ouverture de lightbox
✅ Comportement identique aux images

---

## ✨ Bonus : Boucle Vimeo

**Ajout de `loop=1`** dans les URLs Vimeo de la lightbox :

- Les vidéos Vimeo se jouent maintenant en boucle automatiquement
- Comportement cohérent avec les vidéos MP4

---

**Tout fonctionne maintenant comme prévu !** 🎉
