# Préparer une vidéo avec HandBrake

Cette fiche ne sert que si la page d'envoi le demande. C'est le cas pour une vidéo en **ProRes**, dans un format que le navigateur ne sait pas lire, ou encore trop lourde après compression. Pour toutes les autres vidéos, la page fait le travail toute seule dans Chrome.

## Installer HandBrake (une seule fois)

1. Téléchargez HandBrake sur le site officiel, **https://handbrake.fr**. Ce logiciel est gratuit.
2. Ouvrez le fichier téléchargé et faites glisser **HandBrake** dans le dossier **Applications**.

## Convertir une vidéo

1. Ouvrez HandBrake, puis choisissez votre vidéo (**Open Source**, ou glisser-déposer dans la fenêtre).
2. Dans **Preset** (préréglage), choisissez **General › Fast 1080p30**.
3. Onglet **Summary** :
   - **Format** : **MP4** ;
   - cochez **Web Optimized**.
4. Onglet **Dimensions** : **Resolution Limit** sur **None** (garder la taille d'origine). La page d'envoi réduira ensuite la vidéo à la bonne taille.
5. Onglet **Video** :
   - **Video Encoder** : **H.264 (x264)** ;
   - **Framerate** : **Same as source**, avec **Peak Framerate** coché ;
   - **Quality** : **Constant Quality**, réglée sur **RF 21**.
6. Onglet **Audio** : laissez **AAC**.
7. En bas de la fenêtre, **Save As** : donnez un nom au fichier et choisissez où l'enregistrer (par exemple le Bureau).
8. Cliquez sur **Start**, puis attendez la fin.
9. Envoyez le fichier **.mp4** obtenu par la page d'envoi, comme d'habitude.

> Note pour le développeur : ces réglages reprennent ceux du script `scripts/reencode-videos.sh` (H.264, CRF 21, MP4 « faststart »), sans réduction de taille : la page d'envoi ramène ensuite le petit côté à 1 080 px dans Chrome. Ils n'ont **pas** été testés dans HandBrake, qui n'était pas installé sur la machine de test, et les noms des menus peuvent varier selon la version. À vérifier une fois avec la cliente.
