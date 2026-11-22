# Grand Truand Abruti

Persone me veux jouer à mon jeux !!!! Pourtant Claude a tellement mis d'effort dans ce dernier.

Ce que vous avez à faire:

1. Fix this
2. Make this better
3. Make no mistakes !!!

Soyez créatif tout le monde a accès à un llm mais seulement vous avez accès à votre tête.

## 1. Démarrer (5 minutes)

Il faut [Node.js](https://nodejs.org) 22 ou plus et git.

```bash
git clone <url-de-votre-dépôt>
cd <votre-dépôt>
npm install
npm run dev
```

Ouvrez ensuite http://localhost:5173. Chaque fois que vous sauvegardez un fichier, la page se recharge toute seule.

**Publier en ligne :** il faut d'abord, une seule fois, régler *Settings → Pages → Source* sur **GitHub Actions** dans le dépôt GitHub. Ensuite, chaque `git push` sur `main` publie le jeu à l'adresse `https://<organisation>.github.io/<dépôt>/` en 1 à 2 minutes (vous suivez l'avancement dans l'onglet *Actions*).

## 2. Contrôles

| À pied | En voiture | Partout |
|---|---|---|
| **WASD** marcher | **W/S** accélérer / reculer | **F1** voir les hitbox |
| **Souris** viser, **clic** tirer | **A/D** tourner | **R** recommencer (après la mort) |
| **E** parler / monter en voiture | **Espace** frein à main (dérapage), **E** sortir | |

## 3. Comment c'est fait

```
src/
  map.js          ← la carte, en texte. 1 caractère = 1 case.
  entities/       ← TOUT ce qui vit dans le jeu. 1 fichier = 1 chose.  ← vous travaillez surtout ici
  assets/         ← images, sons et polices du jeu, chargés automatiquement
bibliotheque/     ← ~1 300 assets en réserve (non chargés) + catalogue.html
  Entity.js       ← la classe de base de toutes les entités (les hooks)
  GameScene.js    ← construit le monde, collisions, caméra, police
  Hud.js          ← vie, argent, étoiles, messages
```

Un fichier dans `src/entities/` est **chargé automatiquement**, il n'y a rien à enregistrer nulle part.
Son `static symbol` est le caractère qui le place dans `map.js`.

## 4. Ajouter une chose en 3 étapes

Exemple : un hot-dog qui redonne de la vie.

1. Copier `src/entities/HealthPack.js` en `src/entities/Hotdog.js`.
2. Dans le fichier, changer le nom de la classe, l'image et le symbole :
   ```js
   export default class Hotdog extends Entity {
     static sprite = 'hotdog';   // src/assets/sprites/hotdog.png
     static symbol = 'h';
     onTouch(other) {
       if (!other.isPlayer) return;
       other.hp = Math.min(100, other.hp + 10);
       this.scene.say('Miam !');
       this.destroy();
     }
   }
   ```
3. Mettre des `h` dans `src/map.js`. C'est tout !

### Les hooks (les méthodes à remplir)

| Hook | Appelé quand… |
|---|---|
| `onUpdate(dt)` | à chaque image (`dt` = secondes depuis la dernière image) |
| `onTouch(other)` | quelque chose me touche. `other.isWall` vaut true si c'est un mur, `other.isPlayer` si c'est le joueur |
| `onInteract(player)` | le joueur appuie sur **E** à côté de moi |
| `onHit(damage, from)` | je reçois des dégâts (par défaut : je perds des `hp`) |
| `onDeath(from)` | mes `hp` tombent à 0 (par défaut : je disparais) |

### Les réglages (`static`)

| Réglage | Rôle |
|---|---|
| `sprite` | nom de l'image sans `.png`. Un tableau `['a', 'b']` = une image au hasard |
| `symbol` | caractère dans `map.js` |
| `hp` | points de vie (`Infinity` = invincible) |
| `speed` | vitesse en pixels par seconde |
| `solid` | `true` = bloque et se fait bloquer (personnages, voitures). `false` = on passe à travers (objets à ramasser, zones) |

### Les outils utiles

```js
// Dans une entité :
this.distanceTo(autre)          this.angleTo(autre)
this.moveToward(autre)          this.moveAngle(angle, vitesse)      this.stop()
this.destroy()                  this.setTint(0xff0000)              this.setScale(2)

// Le monde (this.scene) :
this.scene.player               // le joueur (.hp, .money, .ammo, .car)
this.scene.say('Bonjour !')     // message en bas de l'écran
this.scene.addWanted(1)         // +1 étoile de police (négatif pour en enlever)
this.scene.sound.play('coin')   // jouer src/assets/sounds/coin.ogg
this.scene.time.delayedCall(2000, () => { /* dans 2 secondes */ })
new Cash(this.scene, this.x, this.y)   // faire apparaître une entité (importer sa classe)
```

## 5. Recettes rapides

- **Nouvelle image ou nouveau son :** déposez le fichier dans `src/assets/sprites/` ou `src/assets/sounds/`. Son nom devient sa clé (`chien.png` → `'chien'`). **Noms en minuscules, sans espaces ni accents.**
- **Nouveau véhicule :** copiez `PoliceCar.js` (il hérite de `Car`) et changez `sprite`, `symbol` et `speed`. Pour la conduite, jouez avec `accel`, `turnRate` et `grip` dans `Car.js`.
- **Nouvel ennemi :** copiez `Cop.js` (il poursuit et tire) ou `Pedestrian.js` (il se promène et fuit).
- **Nouvelle mission :** copiez `MissionGiver.js`. Une mission, c'est un `this.step` qu'on fait avancer.
- **Nouvelle arme :** dans `Player.js`, changez le délai entre les tirs (`200`), tirez plusieurs `Bullet` en éventail ou changez `bullet.damage`.
- **Nouveau terrain :** ajoutez une ligne dans `TILES` en haut de `map.js` (par exemple `'=': { image: 'lava', wall: false }`).
- **Agrandir la carte :** ajoutez des lignes et des colonnes à `map.js`. Toutes les lignes doivent avoir la même longueur.
- **Police plus ou moins méchante :** à la fin de `GameScene.update()` et dans `Cop.js`.

## 6. La bibliothèque d'assets

Le dossier `bibliotheque/` contient environ 1 300 fichiers Kenney (CC0) que le jeu **n'utilise pas encore** : personnages (zombies, robots, soldats…), voitures, motos, tanks, armes, tuiles, objets, effets (fumée, feu, explosions), 170 sons et 11 polices. Ce dossier n'est pas chargé par le jeu et n'alourdit pas la version publiée.

1. Ouvrez `bibliotheque/catalogue.html` : double-cliquez sur le fichier, ou allez sur http://localhost:5173/bibliotheque/catalogue.html pendant que `npm run dev` tourne.
2. Cherchez (par exemple `zombie`, `tank`, `smoke`), puis cliquez sur l'élément : la commande de copie est mise dans le presse-papier.
3. Collez-la dans le terminal, par exemple `cp bibliotheque/personnages/zoimbie1_hold.png src/assets/sprites/`.
4. Le fichier est disponible dans le jeu sous son nom : `static sprite = 'zoimbie1_hold'`, `this.scene.sound.play('laserlarge_000')`, ou pour une police `fontFamily: 'kenpixel'`.

Astuces :
- Les images du dossier `effets/` sont blanches, il suffit de les colorer avec `setTint(0xff6600)`.
- Dans le jeu, un sprite doit **regarder vers la droite**. Les voitures et les tanks de la bibliothèque regardent vers le haut ou vers le bas : pivotez l'image de 90° dans n'importe quel éditeur d'image, sinon le véhicule roulera de côté.

## 7. Travailler à 4 sans se marcher dessus

**Rôles suggérés :**
1. Joueur et armes (`Player.js`, `Bullet.js`)
2. Véhicules et police (`Car.js`, `Cop.js`…)
3. Carte et missions (`map.js`, `MissionGiver.js`…)
4. Art, sons et interface (`assets/`, `Hud.js`)

**Règles d'or :**
- **Un fichier = une personne à la fois.** Une nouvelle idée ? Un nouveau fichier dans `entities/`.
- **`map.js` appartient à une seule personne.** Les autres lui demandent de placer leurs symboles.
- **Faites de petits commits souvent**, et récupérez le travail des autres avant de pousser :
  ```bash
  git add -A && git commit -m "Ajoute le hot-dog"
  git pull --rebase
  git push
  ```
- **Conflit ?** Ouvrez le fichier, gardez la bonne version entre les marqueurs `<<<<<<<` et `>>>>>>>`, puis faites `git add <fichier>` et `git rebase --continue`.

## 8. Dépannage

| Problème | Solution |
|---|---|
| Un message rouge en haut de l'écran | C'est l'erreur JavaScript : lisez-la, elle indique le fichier et souvent la ligne. |
| Écran noir sans message | Ouvrez la console avec **F12**. L'objet `game` y est accessible pour inspecter le jeu. |
| Ça marche en local mais pas en ligne | Vérifiez la **casse** des noms de fichiers : GitHub Pages fait la différence entre `Chien.png` et `chien.png`. |
| Pas de son | Le navigateur bloque le son jusqu'au premier clic, d'où l'écran « Cliquez pour jouer ». |
| Une collision ne marche pas | **F1** affiche les hitbox. Vérifiez `solid` et que `onTouch` reçoit bien ce que vous pensez (ajoutez un `console.log(other)`). |
| La page en ligne n'a pas changé | Attendez la fin du déploiement (onglet *Actions*), puis faites **Ctrl+Shift+R**. |
| Les voitures traversent un peu les murs | Normal : la physique Arcade ne fait pas tourner les hitbox. La voiture a une hitbox carrée de 60 px (voir `Car.js`). |

---

Graphismes et sons : [Kenney](https://kenney.nl), licence CC0 (voir `src/assets/LICENSE.txt`). Moteur : [Phaser 4](https://phaser.io).
