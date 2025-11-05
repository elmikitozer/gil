# Guide : Ajouter des vidéos dans les albums du carrousel

## ✅ Ce qui a été implémenté

Le système détecte maintenant **automatiquement** si un fichier dans `album_photos` est une vidéo ou une image, et l'affiche correctement dans le carrousel avec les miniatures.

## 📋 Comment faire dans Storyblok

### 1. Dans votre composant `media_item`

Vous avez déjà le champ `album_photos` (Multi-asset). Il accepte maintenant **à la fois des images ET des vidéos**.

### 2. Ajouter des vidéos dans un album

Quand vous configurez un `media_item` :

1. **Sélectionnez les médias** dans `album_photos` :
   - Photos (`.jpg`, `.png`, `.webp`, etc.)
   - **Vidéos** (`.mp4`, `.webm`, `.mov`)

2. **Mélangez-les** comme vous voulez ! Par exemple :
   ```
   album_photos: [photo1.jpg, video1.mp4, photo2.jpg, video2.mp4]
   ```

### 3. Exemple concret

#### Exemple 1 : Album mixte photos + vidéos

**MediaItem 1 :**
- `media` : photo_couverture.jpg
- `album_photos` :
  - photo1.jpg
  - photo2.jpg
  - video_bts.mp4 ← Vidéo dans l'album !
  - photo3.jpg
  - video_final.mp4 ← Autre vidéo !
- `is_cover_photo` : ✅

→ Quand on clique sur cette photo, le carrousel s'ouvre avec 5 items : 3 photos + 2 vidéos.

#### Exemple 2 : Album 100% vidéos

**MediaItem 2 :**
- `media` : thumbnail_reel.jpg (image de couverture)
- `album_photos` :
  - clip1.mp4
  - clip2.mp4
  - clip3.mp4
- `is_cover_photo` : ✅

→ Un album carrousel de vidéos uniquement !

## 🎨 Fonctionnalités automatiques

### Détection automatique
Le code détecte le type de fichier par son extension :
- `.mp4`, `.webm`, `.mov` → Vidéo
- Tout le reste → Image

### Miniatures vidéo
- Si vous avez un champ `poster` dans votre asset Storyblok, il sera utilisé comme vignette
- Sinon, une icône "play" apparaît sur fond gris

### Lecture dans le carrousel
- Les vidéos s'ouvrent avec les contrôles natifs
- Lecture automatique (`autoPlay`)
- Possibilité de mettre en pleine écran
- Son activé par défaut

## 🔧 Champs optionnels dans Storyblok (pour les vidéos)

Si vous voulez améliorer l'affichage des vidéos, vous pouvez ajouter ces champs à vos assets :

### Champ `poster` (Asset)
- Une image statique qui s'affiche avant la lecture
- Utilisée aussi pour la miniature dans le carrousel

### Champ `title` (Text)
- Titre de la vidéo
- Affiché si la vidéo ne charge pas

## 📝 Types de médias supportés dans les albums

| Type | Extension | Affichage | Miniature |
|------|-----------|-----------|-----------|
| Image | `.jpg`, `.png`, `.webp`, `.gif` | Next.js Image | Thumbnail de l'image |
| Vidéo | `.mp4`, `.webm`, `.mov` | `<video>` natif avec contrôles | Poster ou icône play |

## ⚠️ Limitations actuelles

1. **Vimeo/Hybrid dans albums** : Pas encore supporté automatiquement (seulement vidéos hébergées)
2. **Poster obligatoire** : Pour de belles miniatures vidéo, pensez à ajouter un champ `poster` à vos assets vidéo dans Storyblok

## 🚀 Pour aller plus loin

Si tu veux supporter les vidéos Vimeo dans les albums, il faudrait :
1. Ajouter un champ `vimeo_id` dans les assets Storyblok
2. Modifier le code de détection dans `MediaItem.tsx`

Veux-tu que je l'implémente ?

