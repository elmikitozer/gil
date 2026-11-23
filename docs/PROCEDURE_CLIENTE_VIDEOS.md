# Ajouter une vidéo sur le site

Cette fiche explique comment mettre une nouvelle vidéo sur le site, du fichier sur votre ordinateur jusqu'à la vidéo en ligne.

Il faut compter quelques minutes. Vous avez besoin de **Google Chrome** et de deux accès : le mot de passe de la page d'envoi et votre compte Storyblok habituel.

## 1. Envoyer la vidéo

1. Ouvrez **Google Chrome** à l'adresse **https://gilanselmi.com/admin/videos**.
   - Utilisez bien Chrome. Safari ne sait pas compresser les vidéos : il envoie celles qui sont déjà légères et vous demande d'ouvrir Chrome pour les autres.
2. Saisissez le mot de passe, puis cliquez sur **Se connecter**.
   - La connexion reste valable 30 jours sur cet ordinateur.
3. Faites glisser votre vidéo dans le grand cadre en pointillés.
   - Vous pouvez aussi cliquer dans le cadre pour choisir le fichier.
   - Formats acceptés : **.mp4** ou **.mov**, **60 secondes au plus**.
4. Attendez la fin, sans fermer la page. Une barre de progression affiche les étapes :
   - **Analyse de la vidéo** ;
   - **Compression de la vidéo**, seulement si elle est lourde : de quelques secondes à environ une minute ;
   - **Envoi de la vidéo**, puis **Envoi de l'affiche**.
5. Un cadre vert s'affiche : **« C'est en ligne »**, suivi du poids de la vidéo.
   - Par exemple : « Vidéo compressée : 7,9 Mo → 1,8 Mo ».
6. Cliquez sur **Copier**, à droite du lien. Le bouton affiche alors **« Copié »**.

Vous n'avez pas besoin de renommer le fichier : la page s'en charge, et une vidéo qui porte le même nom qu'une autre ne l'écrase jamais.

Pour retrouver le lien d'une vidéo envoyée plus tôt, regardez la liste **« Vidéos déjà envoyées »**, plus bas dans la page. Chaque vidéo y a son bouton **Copier**.

## 2. Placer la vidéo dans Storyblok

1. Ouvrez la page d'accueil dans l'éditeur visuel de Storyblok, comme d'habitude.
2. Ajoutez un bloc vidéo (**video_item**), ou ouvrez celui que vous voulez modifier.
3. Collez le lien dans le champ **srcMp4**.
   - Vous n'avez rien d'autre à remplir : l'image d'attente (« affiche ») et les proportions de la vidéo sont trouvées automatiquement.
4. Déplacez le bloc où vous voulez dans la grille, puis cliquez sur **Publier**.

Dans l'éditeur, une vidéo qui n'a **pas** été envoyée par cette page porte un bandeau jaune : **« Vidéo à renvoyer par la page d'envoi »**. Ce bandeau n'apparaît jamais sur le site public. Pour le faire disparaître, envoyez la vidéo par la page, puis remplacez le lien.

## Si un message rouge s'affiche

Le message dit toujours quoi faire. Les cas les plus fréquents :

| Message | Que faire |
|---|---|
| « Cette vidéo dure … s ; la limite est de 60 s » | Raccourcissez la vidéo dans votre logiciel de montage, puis renvoyez-la. |
| « Cette vidéo est en ProRes… » ou « …que le navigateur ne sait pas lire » | Convertissez-la avec HandBrake (voir la fiche **Préparer une vidéo avec HandBrake**), puis envoyez le fichier obtenu. |
| « Cette vidéo est en HDR… » | Exportez-la en SDR depuis votre logiciel de montage. Sur iPhone, vous pouvez désactiver Réglages › Appareil photo › Enregistrer vidéo › Vidéo HDR avant de filmer. |
| « …ce navigateur ne sait pas le faire correctement. Ouvrez cette page dans Google Chrome… » | Vous êtes dans Safari : recommencez dans Chrome. |
| « Même compressée, cette vidéo pèse … » | Raccourcissez-la, ou passez par HandBrake. |
| « Votre session a expiré » | Rechargez la page et saisissez de nouveau le mot de passe. |
| « L'envoi a été interrompu » | Vérifiez votre connexion à Internet et recommencez. |

En cas de doute, faites une capture d'écran du message et envoyez-la à votre développeur.
