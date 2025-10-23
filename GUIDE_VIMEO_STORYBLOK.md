# 🎬 Guide : Intégrer Vimeo dans Storyblok (GridMasonry)

## Étape 1 : Créer un compte Vimeo

1. **Inscription** : [https://vimeo.com/join](https://vimeo.com/join)
2. **Gratuit pour commencer** (5 GB de stockage)
3. **Upgrader vers Plus** (optionnel) : [https://vimeo.com/upgrade](https://vimeo.com/upgrade) - 7€/mois

---

## Étape 2 : Uploader une vidéo

1. Connectez-vous à Vimeo
2. Cliquez sur **"Upload"** en haut à droite
3. Sélectionnez votre vidéo
4. Une fois uploadée, vous verrez une URL comme :
   ```
   https://vimeo.com/987654321
   ```
5. **Copiez l'ID** (le nombre) : `987654321`

### Paramètres importants dans Vimeo :

- **Privacy** : Choisissez "Unlisted" (la vidéo n'apparaît pas dans les recherches mais est accessible via le lien)
- **Embed** : Activez "Enable embedding" (permet d'intégrer la vidéo sur votre site)

---

## Étape 3 : Configurer le schéma `video_item` dans Storyblok

1. Allez dans **Storyblok > Components**
2. Trouvez votre composant **`video_item`** (ou créez-le s'il n'existe pas)
3. Ajoutez ces champs (s'ils n'existent pas déjà) :

### Champs à ajouter :

#### 1. `video_source` (Option)

- **Type** : Option
- **Options** :
  - Name: "MP4", Value: "mp4"
  - Name: "Vimeo", Value: "vimeo"
- **Default value** : "mp4"
- **Description** : "Source de la vidéo"

#### 2. `vimeoId` (Text)

- **Type** : Text
- **Description** : "ID de la vidéo Vimeo (ex: 987654321). Utilisé uniquement si source = vimeo"

#### 3. `srcMp4` (Text)

- **Type** : Text
- **Description** : "URL de la vidéo MP4. Utilisé uniquement si source = mp4"

#### 4. `srcWebm` (Text - optionnel)

- **Type** : Text
- **Description** : "URL de la vidéo WebM (optionnel)"

#### 5. `poster` (Asset)

- **Type** : Asset
- **Filetypes** : Images
- **Description** : "Image de prévisualisation (thumbnail)"

#### 6. `ratio` (Text)

- **Type** : Text
- **Default value** : "16:9"
- **Description** : "Ratio de la vidéo (exemples: 16:9, 9:16, 1:1)"

#### 7. `title` (Text)

- **Type** : Text
- **Description** : "Titre affiché au survol"

#### 8. `caption` (Textarea)

- **Type** : Textarea
- **Description** : "Description affichée au survol"

---

## Étape 4 : Créer un `video_item` avec Vimeo

1. Dans Storyblok, allez dans un **GridMasonry**
2. Ajoutez un **video_item**
3. Configurez-le ainsi :

### Exemple avec Vimeo :

```
video_source: "vimeo"
vimeoId: "987654321"  ← L'ID de votre vidéo Vimeo
poster: [choisissez une image]
ratio: "16:9"
title: "Ma vidéo"
caption: "Description de la vidéo"
```

### Exemple avec MP4 (Storyblok Assets) :

```
video_source: "mp4"
srcMp4: "https://a.storyblok.com/f/.../ma-video.mp4"
poster: [choisissez une image]
ratio: "16:9"
title: "Ma vidéo"
caption: "Description de la vidéo"
```

---

## Étape 5 : Tester

1. Sauvegardez votre contenu dans Storyblok
2. Allez sur votre site
3. Vous devriez voir la vidéo Vimeo s'afficher dans votre galerie !

---

## ❓ FAQ

### Q: Puis-je mélanger Vimeo et MP4 dans la même galerie ?

**R:** Oui ! C'est exactement l'intérêt du champ `video_source`. Certaines vidéos peuvent être sur Vimeo, d'autres en MP4.

### Q: La vidéo Vimeo ne s'affiche pas

**R:** Vérifiez que :

- L'ID est correct (juste le nombre, pas l'URL complète)
- Dans les paramètres Vimeo de la vidéo, "Enable embedding" est activé
- La vidéo n'est pas en "Private" (utilisez "Unlisted" à la place)

### Q: Comment rendre la vidéo privée ?

**R:** Dans Vimeo, utilisez le paramètre "Unlisted" au lieu de "Public". La vidéo ne sera accessible que via votre site.

### Q: Vimeo gratuit suffit-il ?

**R:** Pour commencer, oui ! 5 GB = environ 20-50 vidéos courtes. Si vous dépassez, passez à Vimeo Plus (7€/mois, 250 GB).

---

## 🎯 Checklist

- [ ] Créer un compte Vimeo
- [ ] Uploader une vidéo test
- [ ] Copier l'ID de la vidéo
- [ ] Configurer le schéma `video_item` dans Storyblok (ajouter les champs ci-dessus)
- [ ] Créer un `video_item` avec `video_source: "vimeo"`
- [ ] Tester sur votre site
- [ ] Ça marche ! 🎉

---

**Besoin d'aide ?** Contactez-moi si vous rencontrez un problème !
