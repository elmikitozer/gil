# ✅ Vimeo est maintenant intégré à votre site !

## 🎉 Ce qui a été fait

Votre système supporte maintenant **3 types de médias** dans GridMasonry :

1. **Images** (media_item)
2. **Vidéos MP4** (video_item avec source = mp4)
3. **Vidéos Vimeo** (video_item avec source = vimeo) ← **NOUVEAU !**

---

## 🚀 Comment utiliser Vimeo maintenant

### Étape 1 : Créer un compte Vimeo

**Lien d'inscription :** [https://vimeo.com/join](https://vimeo.com/join)

**Options :**

- **Vimeo Free** (0€) : 5 GB, parfait pour commencer
- **Vimeo Plus** (7€/mois) : 250 GB, sans marque Vimeo, player personnalisable

---

### Étape 2 : Uploader une vidéo

1. Connectez-vous à Vimeo
2. Cliquez sur **"Upload"**
3. Uploadez votre vidéo
4. Une fois uploadée, vous verrez une URL :
   ```
   https://vimeo.com/987654321
   ```
5. **Copiez l'ID** : `987654321`

**Paramètres importants dans Vimeo :**

- **Privacy** : "Unlisted" (accessible via lien uniquement)
- **Embed** : Activez "Enable embedding"

---

### Étape 3 : Configurer le schéma `video_item` dans Storyblok

Dans **Storyblok > Components > video_item**, ajoutez ces champs :

#### Champs nécessaires :

1. **`video_source`** (Option)

   - Type : Option
   - Options :
     - "MP4" (value: `mp4`)
     - "Vimeo" (value: `vimeo`)
   - Default : `mp4`

2. **`vimeoId`** (Text)

   - Type : Text
   - Description : "ID de la vidéo Vimeo (ex: 987654321)"

3. **`srcMp4`** (Text) - déjà existant normalement

   - Pour les vidéos MP4

4. **`poster`** (Asset)

   - Type : Asset (Images)
   - Thumbnail de la vidéo

5. **`ratio`** (Text)

   - Default : "16:9"
   - Exemples : "16:9", "9:16", "1:1", "4:3"

6. **`title`** et **`caption`** (Text/Textarea)
   - Pour le hover

---

### Étape 4 : Créer un video_item avec Vimeo

Dans Storyblok, dans un GridMasonry :

1. Ajoutez un **video_item**
2. Configurez-le :

```
video_source: "vimeo"
vimeoId: "987654321"  ← L'ID de votre vidéo Vimeo
poster: [image de prévisualisation]
ratio: "16:9"
title: "Titre de la vidéo"
caption: "Description"
```

---

## 💡 Exemples de configuration

### Vidéo Vimeo :

```
video_source: vimeo
vimeoId: 987654321
ratio: 16:9
title: Ma vidéo Vimeo
```

### Vidéo MP4 (Storyblok Assets) :

```
video_source: mp4
srcMp4: https://a.storyblok.com/f/.../video.mp4
ratio: 16:9
title: Ma vidéo MP4
```

### Vidéo verticale (format Instagram/TikTok) :

```
video_source: vimeo
vimeoId: 123456789
ratio: 9:16  ← Format vertical
```

---

## 🎯 Fonctionnalités

✅ **Dans la galerie (miniature) :**

- Affiche le thumbnail de la vidéo
- Icône "play" au survol
- Hover avec titre et caption

✅ **Dans la lightbox (plein écran) :**

- Player Vimeo avec contrôles
- Lecture automatique
- Plein écran possible
- Navigation entre médias (flèches)

✅ **Mixte :**
Vous pouvez mélanger images, vidéos MP4 et vidéos Vimeo dans la même galerie !

---

## 📊 Recommandation : Quelle solution choisir ?

### Scénario 1 : Moins de 30 vidéos courtes

→ **Vimeo Free (0€)** suffit largement

### Scénario 2 : 50+ vidéos ou vidéos longues

→ **Vimeo Plus (7€/mois)** recommandé

- 250 GB de stockage
- Pas de marque Vimeo
- Player personnalisable

### Scénario 3 : Budget = 0€

→ **Solution hybride** :

- Vidéos importantes → Vimeo Free
- Petites vidéos → Storyblok Assets (compressées avec ffmpeg)

---

## 🛠️ Compression vidéo (si vous utilisez MP4)

Pour réduire la taille de vos vidéos avant upload :

```bash
# Compression équilibrée (recommandé)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Compression agressive (fichier plus petit)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k output.mp4
```

---

## ❓ FAQ

### Q: La vidéo ne s'affiche pas

**R:** Vérifiez :

- L'ID est correct (juste le nombre, pas l'URL)
- "Enable embedding" est activé dans les paramètres Vimeo
- La vidéo n'est pas "Private" (utilisez "Unlisted")

### Q: Puis-je mélanger Vimeo et MP4 ?

**R:** Oui ! Grâce au champ `video_source`, chaque vidéo peut avoir sa propre source.

### Q: Comment rendre mes vidéos privées ?

**R:** Utilisez "Unlisted" dans Vimeo. La vidéo ne sera accessible que via votre site.

### Q: Vimeo Free suffit-il ?

**R:** Pour 20-50 vidéos courtes, oui ! Sinon, passez à Plus (7€/mois).

---

## 🎬 Fichiers créés/modifiés

### Nouveaux fichiers :

- ✅ `app/components/ZoomableVimeo.tsx` - Composant pour afficher Vimeo
- ✅ `storyblok/VideoItemHybrid.tsx` - Composant standalone (optionnel)
- ✅ `GUIDE_VIMEO_STORYBLOK.md` - Guide détaillé

### Fichiers modifiés :

- ✅ `storyblok/GridMasonry.tsx` - Supporte maintenant Vimeo
- ✅ `app/components/MasonryColumns.tsx` - Affiche les vidéos Vimeo
- ✅ `app/components/ui/gallery/GalleryContext.tsx` - Type VimeoVideoItem
- ✅ `app/components/ui/gallery/Lightbox.tsx` - Affiche Vimeo en plein écran
- ✅ `app/components/ZoomableVideo.tsx` - Corrections du bug de lecture

---

## 🎯 Prochaines étapes

1. ✅ **Créer un compte Vimeo** : [https://vimeo.com/join](https://vimeo.com/join)
2. ✅ **Uploader une vidéo test**
3. ✅ **Configurer le schéma dans Storyblok** (ajouter les champs)
4. ✅ **Créer un video_item avec Vimeo**
5. ✅ **Tester sur votre site**

---

## 🆘 Besoin d'aide ?

Si vous rencontrez un problème :

1. Vérifiez que le champ `video_source` existe dans votre schéma Storyblok
2. Vérifiez que l'ID Vimeo est correct
3. Ouvrez la console du navigateur (F12) pour voir les éventuelles erreurs

---

**Tout est prêt ! Vous pouvez maintenant uploader vos vidéos sur Vimeo et les intégrer dans votre site.** 🚀

**Prix : 0€ (Vimeo Free) ou 7€/mois (Vimeo Plus) pour une infrastructure vidéo professionnelle !**
