# 🎬 Setup Solution Hybride : Cloudinary + Vimeo

## 📋 Concept

**Votre système hybride :**

- ✅ **Thumbnails (grille)** : Vidéos courtes Cloudinary → autoplay sans son
- ✅ **Pop-up (lightbox)** : Vidéos complètes Vimeo → avec son et contrôles

---

## 🚀 Étape 1 : Setup Cloudinary (gratuit)

### 1.1 Créer un compte

1. **Inscription** : [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Remplissez le formulaire
3. Confirmez votre email

### 1.2 Récupérer vos identifiants

Une fois connecté, vous verrez :

```
Cloud name: votre-cloud-name
API Key: 123456789012345
```

Notez votre **Cloud name** (vous en aurez besoin).

---

## 📹 Étape 2 : Préparer vos vidéos

### 2.1 Vidéos courtes pour thumbnails (Cloudinary)

**Durée recommandée** : 5-15 secondes max
**Taille cible** : 5-15 MB

**Comment créer une preview courte :**

```bash
# Option 1 : Couper les 10 premières secondes
ffmpeg -i video-complete.mp4 -t 10 -c copy preview.mp4

# Option 2 : Couper de 5s à 15s (10 secondes)
ffmpeg -i video-complete.mp4 -ss 5 -t 10 -c copy preview.mp4

# Option 3 : Compresser + couper
ffmpeg -i video-complete.mp4 -t 10 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k preview.mp4
```

**Astuce :** Choisissez le moment le plus dynamique/intéressant de votre vidéo !

### 2.2 Vidéos complètes pour lightbox (Vimeo)

**Durée** : Complète (30s - 3min+)
**Qualité** : Haute qualité (Vimeo compresse automatiquement)

---

## ☁️ Étape 3 : Upload sur Cloudinary

### 3.1 Via l'interface web (recommandé pour débuter)

1. **Dashboard** : [cloudinary.com/console](https://cloudinary.com/console)
2. **Media Library** (menu gauche)
3. **Upload** (bouton en haut)
4. **Sélectionnez vos vidéos courtes**
5. Attendez l'upload

### 3.2 Récupérer l'URL

Une fois uploadée, cliquez sur la vidéo :

```
URL format automatique :
https://res.cloudinary.com/[cloud-name]/video/upload/v1234567890/nom-video.mp4

Exemple :
https://res.cloudinary.com/gilanselmi/video/upload/v1730000000/preview-projet1.mp4
```

**Copiez cette URL** → Vous la mettrez dans `srcMp4` dans Storyblok

### 3.3 Optimisation automatique (optionnel)

Cloudinary peut optimiser automatiquement. Modifiez l'URL :

```
Originale :
https://res.cloudinary.com/[cloud]/video/upload/v123/video.mp4

Optimisée (qualité auto + format auto) :
https://res.cloudinary.com/[cloud]/video/upload/q_auto,f_auto/v123/video.mp4
```

---

## 📺 Étape 4 : Upload sur Vimeo

### 4.1 Créer un compte Vimeo Free

1. **Inscription** : [vimeo.com/join](https://vimeo.com/join)
2. Remplissez le formulaire

### 4.2 Upload vidéo complète

1. Cliquez sur **Upload**
2. Sélectionnez votre **vidéo complète**
3. Attendez l'upload et le processing

### 4.3 Configurer la vidéo

**Paramètres importants :**

1. **Privacy** → Choisissez **"Unlisted"**

   - La vidéo ne sera visible que sur votre site
   - N'apparaît pas dans les recherches Vimeo

2. **Embed** → Activez **"Enable embedding"**

   - Permet d'intégrer la vidéo sur votre site

3. **Distribution** → Désactivez **"Allow downloads"** (optionnel)

### 4.4 Récupérer l'ID

URL de votre vidéo :

```
https://vimeo.com/987654321
                  ↑↑↑↑↑↑↑↑↑
                  C'est l'ID !
```

**Copiez juste le nombre** : `987654321`

---

## 🎨 Étape 5 : Configuration dans Storyblok

### 5.1 Vérifier votre schéma `video_item`

Dans **Storyblok > Components > video_item**, assurez-vous d'avoir :

1. **`video_source`** (Option - optionnel grâce à l'auto-détection)

   - Options : "mp4", "vimeo"

2. **`vimeoId`** (Text)

   - Pour les vidéos Vimeo

3. **`srcMp4`** (Text)

   - Pour les URLs Cloudinary

4. **`ratio`** (Text)

   - Défaut : "16:9"

5. **`title`** et **`caption`** (Text/Textarea)
   - Pour le hover

### 5.2 Créer un video_item HYBRIDE

**Configuration pour un projet complet :**

```
┌─────────────────────────────────────┐
│ video_item #1                       │
├─────────────────────────────────────┤
│ srcMp4: https://res.cloudinary...   │ ← Preview courte (autoplay)
│ vimeoId: 987654321                  │ ← Vidéo complète (lightbox)
│ ratio: 16:9                         │
│ title: "Mon Projet"                 │
│ caption: "Description"              │
└─────────────────────────────────────┘
```

**Comment ça marche :**

1. **Dans la grille** → Joue la vidéo Cloudinary (courte, autoplay)
2. **Au clic** → Ouvre la lightbox Vimeo (complète, avec son)

---

## 🎯 Workflow complet - Exemple pratique

### Exemple : Projet "Beauty Campaign"

#### 1. Préparez 2 versions

**Version courte (10s) :**

```bash
ffmpeg -i beauty-campaign.mp4 -t 10 -c:v libx264 -crf 28 -c:a aac -b:a 96k beauty-preview.mp4
```

→ Résultat : `beauty-preview.mp4` (8 MB)

**Version complète :**
→ `beauty-campaign.mp4` (180 MB)

#### 2. Upload

**Cloudinary :**

- Upload `beauty-preview.mp4`
- URL : `https://res.cloudinary.com/gilanselmi/video/upload/v123/beauty-preview.mp4`

**Vimeo :**

- Upload `beauty-campaign.mp4`
- ID : `987654321`

#### 3. Dans Storyblok

```
GridMasonry > Ajouter video_item
├─ srcMp4: https://res.cloudinary.com/.../beauty-preview.mp4
├─ vimeoId: 987654321
├─ ratio: 16:9
├─ title: Beauty Campaign
└─ caption: Campaign for XYZ brand
```

#### 4. Résultat sur votre site

**Grille :**

- 🎬 Vidéo courte joue automatiquement (muted, loop)
- Thumbnail dynamique et engageant

**Clic :**

- 🔊 Lightbox s'ouvre avec vidéo Vimeo complète
- Avec son, contrôles, plein écran possible

---

## ⚠️ Important : Modification du code nécessaire

**PROBLÈME ACTUEL** : Le code charge soit Cloudinary SOIT Vimeo, pas les deux à la fois.

**Il faut modifier la logique pour :**

- **Grille** : Utiliser `srcMp4` (Cloudinary)
- **Lightbox** : Utiliser `vimeoId` si présent, sinon `srcMp4`

Je peux faire cette modification si vous voulez !

---

## 📊 Limites gratuites

### Cloudinary Free

- ✅ 25 GB stockage (~ 500-1000 previews de 10s)
- ✅ 25 GB bande passante/mois
- ✅ Transformations illimitées

### Vimeo Free

- ✅ 5 GB stockage (~ 10-30 vidéos complètes)
- ✅ Bande passante illimitée ✨
- ⚠️ Marque "Vimeo" visible (mais seulement dans lightbox)

---

## 🎓 Résumé du workflow

```
1. Créer preview courte (10s) → Upload Cloudinary → Copier URL
2. Upload vidéo complète → Upload Vimeo → Copier ID
3. Dans Storyblok video_item :
   - srcMp4 = URL Cloudinary
   - vimeoId = ID Vimeo
4. Enjoy ! 🎉
```

---

## 🆘 Aide

**Questions fréquentes :**

**Q: Puis-je utiliser seulement Cloudinary pour certaines vidéos ?**
R: Oui ! Laissez `vimeoId` vide, la lightbox utilisera aussi `srcMp4`.

**Q: Puis-je utiliser seulement Vimeo ?**
R: Non, Vimeo Free ne permet pas l'autoplay dans la grille. Il faut au minimum une preview Cloudinary.

**Q: Comment savoir combien de bande passante j'utilise ?**
R: Cloudinary Dashboard > Analytics

---

**Besoin d'aide pour la modification du code ? Dites-moi !**
