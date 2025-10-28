# Guide Configuration Album Carrousel

## Fonctionnalité implémentée

✅ **Mode carrousel avec miniatures** : Toutes les photos s'ouvrent maintenant en carrousel avec des miniatures en bas.

✅ **Navigation** : Flèches + miniatures cliquables + navigation clavier.

✅ **Design identique** : Même design que le lightbox actuel, mais avec les miniatures ajoutées.

## Configuration dans Storyblok

### 1. Ajouter les champs dans le composant `media_item`

Dans Storyblok, allez dans **Components** > **media_item** et ajoutez ces champs :

#### Champ `album_photos` (Multi-asset)
- **Field name** : `album_photos`
- **Type** : **Multi-asset**
- **Description** : "Sélectionnez toutes les photos qui appartiennent à cet album"

#### Champ `is_cover_photo` (Boolean) - Optionnel
- **Field name** : `is_cover_photo`
- **Type** : Boolean
- **Description** : "Cochez si cette photo est la photo de couverture de l'album"

### 2. Comment utiliser

**Pour chaque photo d'album** :
- Sélectionnez toutes les photos de l'album dans `album_photos` (Multi-asset)
- Optionnel : Cochez `is_cover_photo` si c'est la photo de couverture
- Quand on clique sur cette photo, elle ouvrira le carrousel avec toutes les photos de l'album

### 3. Exemple d'utilisation

- **Photo 1** : `album_photos` = [Photo1, Photo2, Photo3], `is_cover_photo` = ✅
- **Photo 2** : `album_photos` = [Photo1, Photo2, Photo3], `is_cover_photo` = ❌
- **Photo 3** : `album_photos` = [Photo1, Photo2, Photo3], `is_cover_photo` = ❌

→ Cliquer sur n'importe laquelle des 3 photos ouvrira le carrousel avec les 3 photos.

## Fonctionnalités du carrousel

- **Miniatures en bas** : Cliquez sur une miniature pour aller directement à cette photo
- **Navigation par flèches** : Flèches gauche/droite pour naviguer
- **Navigation clavier** : Flèches du clavier pour naviguer
- **Échapper** : Touche Échap pour fermer
- **Photo active** : La miniature de la photo actuelle est mise en évidence

## Test

1. Configurez quelques photos avec des albums dans Storyblok
2. Publiez les changements
3. Testez en cliquant sur les photos configurées comme albums
4. Vérifiez que le carrousel s'ouvre avec toutes les photos de l'album

## Important

- **Toutes les photos** doivent maintenant avoir des albums configurés
- **Plus de mode zoom** : Toutes les photos s'ouvrent en carrousel
- **Champ obligatoire** : `album_photos` doit être rempli pour chaque photo