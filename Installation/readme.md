Pour mettre en place l'API et le site de CubbyHole :

Installer les logiciels suivants :

- Node.js & npm
- Un serveur MySQL (Compris dans Wamp ou Mamp)
- MongoDB

Lancer les logiciels suivants :

- Serveur MySQL
- Serveur MongoDB :
            - (WINDOWS) Ouvrir une interface de ligne de commande et tapez LE_CHEMIN_D'INSTALLATION\mongodb\bin\mongod.exe
            - (UNIX) Serveur MongoDB (Ouvrir une interace de ligne de commande et taper mongod)

Effectuer les tâches suivantes :

- (MYSQL) Créer une Base de données CubbyHole
- (MYSQL) Importer le fichier CubbyHole.sql présent dans ce dossier via PhpMyAdmin

- (MongoDB) Importer le fichier CubbyHole.json présent dans ce dossier :
            - (WINDOWS) Ouvrir une interface de ligne de commande et taper LE_CHEMIN_D'INSTALLATION\mongodb\bin\mongoimport.exe --db CubbyHole --collection items --file LE_CHEMIN_VERS_LE_FICHIER_JSON\CubbyHole.json
            - (UNIX) Ouvrir une interface de ligne de commande et taper mongoimport --db CubbyHole --collection items --file LE_CHEMIN_VERS_LE_FICHIER_JSON/CubbyHole.json

- Copier le fichier /Api/config.json.default en config.json et y modifier les valeurs dans mysqlServer et mongoDb si nécéssaire.
- Copier le fichier /Website/config/config.json.default en /Website/config/config.json et y modifier les valeurs dans mysqlServer si nécéssaire.

Lancement des applications :
- Ouvrez deux nouvelles interfaces de ligne de commande :

    Premiére interface : Déplacez vous dans le dossier /Api/ et tapez 'grunt'
    Seconde interface : Déplacez vous dans le dossier /Website/ et tapez 'grunt'

Si l'une des deux fenêtre affiche une erreur vérifiez les étapes précédentes ou envoyer un message à alexis

Naviguez vers https://localhost:8443, (acceptez l'erreur de certificat), si vous voyez le site essayez de vous connecter via facebook ou google et tout est bon si ça fonctionne !

Dans le cas ou l'explorateur de fichiers est vide, changez l'ID de votre compte dans la base de données par 53.