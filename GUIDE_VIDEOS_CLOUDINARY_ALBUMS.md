# Guide : Vidéos Cloudinary dans les albums carrousel

## ✅ Nouvelles fonctionnalités

- ✅ **Support Cloudinary** : Ajoutez vos vidéos Cloudinary (plan gratuit) dans les albums
- ✅ **Mode Hybrid** : Cloudinary preview + Vimeo fullscreen dans le lightbox
- ✅ **Touche Échap** : Fermer le carrousel avec Échap
- ✅ **Transitions corrigées** : Plus de bugs d'affichage de la mauvaise image

## 📋 Configuration dans Storyblok

### Étape 1 : Ajouter les champs dans `album_photos`

Pour chaque item que vous ajoutez dans `album_photos`, vous pouvez maintenant utiliser des **champs personnalisés** en plus des assets classiques.

#### Champs disponibles (optionnels selon le type) :

| Champ | Type | Description | Obligatoire pour |
|-------|------|-------------|------------------|
| `cloudinary_url` | Text | URL complète Cloudinary | Vidéo Cloudinary / Hybrid |
| `vimeo_id` | Text | ID de la vidéo Vimeo | Vidéo Vimeo / Hybrid |
| `poster` | Asset | Image thumbnail | Optionnel (recommandé) |
| `title` | Text | Titre du média | Optionnel |
| `alt` | Text | Texte alternatif | Optionnel |
| `filename` | Asset | Image ou vidéo Storyblok | Images / Vidéos assets |

### Étape 2 : Types de médias supportés

#### Type 1 : Image (classique)
```
album_photos: [
  {
    filename: "photo.jpg",
    alt: "Description",
    title: "Ma photo"
  }
]
```

#### Type 2 : Vidéo Cloudinary seule
```
album_photos: [
  {
    cloudinary_url: "https://res.cloudinary.com/gilanselmi/video/upload/v123/preview.mp4",
    poster: {filename: "thumbnail.jpg"},
    title: "Ma vidéo",
    alt: "Description vidéo"
  }
]
```

#### Type 3 : Vidéo Hybrid (Cloudinary + Vimeo) 🏆
**Le meilleur mode pour le plan gratuit !**

```
album_photos: [
  {
    cloudinary_url: "https://res.cloudinary.com/gilanselmi/video/upload/v123/preview-10s.mp4",
    vimeo_id: "987654321",
    poster: {filename: "thumbnail.jpg"},
    title: "Mon projet",
    alt: "Vidéo du projet"
  }
]
```

**Comment ça marche :**
- Dans le **carrousel** (miniatures) : Affiche le preview Cloudinary
- Dans le **lightbox** (plein écran) : Charge la vidéo complète Vimeo

#### Type 4 : Vidéo Vimeo seule
```
album_photos: [
  {
    vimeo_id: "987654321",
    poster: {filename: "thumbnail.jpg"},
    title: "Vidéo Vimeo",
    alt: "Description"
  }
]
```

#### Type 5 : Vidéo depuis assets Storyblok
```
album_photos: [
  {
    filename: "video.mp4",
    poster: {filename: "thumbnail.jpg"},
    title: "Ma vidéo locale"
  }
]
```

### Étape 3 : Exemple d'album mixte complet

```
media_item:
  - media: photo_couverture.jpg  ← Photo de couverture visible dans la grille
  - album_photos: [
      {filename: "photo1.jpg", alt: "Photo 1"},
      {
        cloudinary_url: "https://res.cloudinary.com/.../preview.mp4",
        vimeo_id: "123456",
        poster: {filename: "thumb1.jpg"},
        title: "Making-of"
      },
      {filename: "photo2.jpg", alt: "Photo 2"},
      {
        cloudinary_url: "https://res.cloudinary.com/.../clip.mp4",
        title: "Clip court"
      },
      {filename: "photo3.jpg", alt: "Photo 3"}
    ]
  - is_cover_photo: ✅
```

Résultat : Un carrousel avec 5 items (3 photos + 2 vidéos) !

## 🎬 Workflow recommandé (Plan gratuit)

### 1. Upload sur Cloudinary

1. Connectez-vous sur [cloudinary.com/console](https://cloudinary.com/console)
2. **Media Library** > **Upload** > Sélectionner votre vidéo
3. Attendez la fin de l'upload
4. **Copier l'URL** : Clic droit sur la vidéo > **Copy URL**
   - Format : `https://res.cloudinary.com/[cloud-name]/video/upload/v1234/[video].mp4`

### 2. (Optionnel) Créer un preview court

Pour économiser la bande passante Cloudinary, créez des previews courts (8-10s) :

```bash
# Avec ffmpeg (installer si nécessaire)
ffmpeg -i video_complete.mp4 -t 10 -c copy preview-10s.mp4
```

Puis uploadez le preview sur Cloudinary.

### 3. Upload sur Vimeo (pour vidéo complète)

1. [vimeo.com/upload](https://vimeo.com/upload)
2. Uploadez votre vidéo complète
3. Récupérez l'ID : `vimeo.com/987654321` → ID = `987654321`

### 4. Configurer dans Storyblok

Dans `album_photos`, ajoutez un nouvel item avec :
- `cloudinary_url` : URL du preview court Cloudinary
- `vimeo_id` : ID Vimeo de la vidéo complète
- `poster` : Screenshot de la vidéo (optionnel)

## ⚙️ Nouvelles fonctionnalités du carrousel

### Touche Échap
Appuyez sur **Échap** pour fermer le lightbox/carrousel instantanément.

### Transitions améliorées
- ✅ Plus de bugs de mauvaise image affichée
- ✅ Synchronisation corrigée entre les miniatures et l'affichage principal
- ✅ Transitions fluides entre images et vidéos

### Miniatures vidéo
- Les vidéos affichent maintenant leur `poster` dans les miniatures
- Icône "play" superposée pour indiquer que c'est une vidéo

## 🚨 Limites du plan gratuit

### Cloudinary Free
- **Bande passante** : 25 GB/mois
- **Stockage** : 25 GB
- **Transformations** : 25 crédits/mois

**Astuce** : Utilisez des previews courts (10s, basse qualité) pour économiser !

### Vimeo Free
- **Stockage** : 5 GB total
- **Upload** : 500 MB/semaine

**Astuce** : Mode Hybrid = preview Cloudinary + fullscreen Vimeo = Optimal !

## 📊 Calcul approximatif

Exemple pour 10 projets avec vidéo chacun :

| Type | Taille | Cloudinary | Vimeo |
|------|--------|------------|-------|
| Preview 10s (480p) | 5 MB | 50 MB | 0 MB |
| Vidéo complète (1080p) | 200 MB | 0 MB | 2 GB |
| **Total** | — | **50 MB** | **2 GB** |

✅ Largement dans les limites gratuites !

## 🐛 Dépannage

### La vidéo ne se charge pas
1. Vérifiez l'URL Cloudinary (doit être publique)
2. Testez l'URL directement dans un nouvel onglet
3. Vérifiez la console du navigateur pour les erreurs CORS

### La miniature n'apparaît pas
1. Ajoutez un champ `poster` avec une image
2. Vérifiez que l'image est bien uploadée dans Storyblok

### La vidéo lag dans le carrousel
1. Réduisez la durée du preview Cloudinary (8-10s max)
2. Réduisez la qualité : `q_auto:low` dans l'URL
3. Exemple : `https://res.cloudinary.com/.../q_auto:low/v123/video.mp4`

## 📝 Notes techniques

### Détection automatique du type
Le code détecte automatiquement le type en fonction des champs présents :

1. `cloudinary_url` + `vimeo_id` → **Hybrid**
2. `vimeo_id` seul → **Vimeo**
3. `cloudinary_url` seul → **Video Cloudinary**
4. `filename` (`.mp4`/`.webm`/`.mov`) → **Video Asset**
5. `filename` (autre) → **Image**

### Ordre de priorité
Si plusieurs types sont détectés, l'ordre est :
1. Hybrid (préféré)
2. Vimeo
3. Cloudinary
4. Asset Storyblok
5. Image

## ✨ Résumé

✅ **Ajoutez des vidéos Cloudinary** dans vos albums avec un simple lien
✅ **Mode Hybrid** pour le meilleur des deux mondes
✅ **Touche Échap** pour fermer rapidement
✅ **Transitions fluides** sans bugs
✅ **Miniatures avec poster** pour un aperçu pro
✅ **Plan gratuit optimisé** avec previews courts

🎉 Profitez de votre carrousel multimédia complet !

