# ✅ Fix : Support des URLs Vimeo complètes

## 🎯 Problème résolu

Avant, il fallait mettre **juste l'ID** dans Storyblok :
```
vimeoId: "982501226"  ✅
```

Maintenant, vous pouvez mettre **soit l'ID, soit l'URL complète** :
```
vimeoId: "982501226"  ✅
vimeoId: "https://vimeo.com/982501226"  ✅ (nouveau !)
vimeoId: "https://player.vimeo.com/video/982501226"  ✅ (nouveau !)
```

---

## 🔧 Modifications apportées

### Fichier créé : `app/utils/vimeo.ts`

Nouvelle fonction `extractVimeoId()` qui extrait automatiquement l'ID depuis :
- ID simple : `"982501226"`
- URL Vimeo : `"https://vimeo.com/982501226"`
- URL player : `"https://player.vimeo.com/video/982501226"`

### Fichiers modifiés :

1. **`app/components/ui/gallery/Lightbox.tsx`**
   - Utilise `extractVimeoId()` pour nettoyer l'ID
   - Fallback intelligent : si vimeoId invalide sur item hybride, affiche le MP4

2. **`app/components/ZoomableVimeo.tsx`**
   - Utilise `extractVimeoId()` pour nettoyer l'ID
   - Retourne `null` si ID invalide (au lieu de planter)

---

## 🎬 Comment utiliser

### Dans Storyblok, vous pouvez maintenant faire :

#### Option 1 : Juste l'ID (comme avant)
```
vimeoId: 982501226
```

#### Option 2 : URL complète (nouveau, plus simple !)
```
vimeoId: https://vimeo.com/982501226
```

Le système extrait automatiquement l'ID `982501226` !

---

## ✨ Bonus : Fallback intelligent

Si vous configurez un item **hybride** mais que le vimeoId est invalide :
```
srcMp4: "https://res.cloudinary.com/.../preview.mp4"
vimeoId: "invalid"  ← ID invalide
```

**Résultat :**
- Grille : Preview MP4 ✅
- Lightbox : MP4 (fallback automatique) ✅

Plus d'erreur "Sorry we're having a problem" !

---

## 🧪 Test

1. Dans Storyblok, modifiez un `video_item`
2. Dans le champ `vimeoId`, collez l'URL complète : `https://vimeo.com/982501226`
3. Sauvegardez
4. Rechargez votre site
5. Cliquez sur la vidéo
6. ✅ Ça fonctionne !

---

**Le problème est résolu !** Vous pouvez maintenant copier-coller directement les URLs Vimeo depuis votre navigateur. 🎉

