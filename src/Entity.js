import * as Phaser from 'phaser';

// Classe de base de TOUT ce qui existe dans le monde.
// Pour créer une chose : copier un fichier de src/entities/, changer les static et remplir les hooks.
export default class Entity extends Phaser.Physics.Arcade.Sprite {
  static sprite = null;     // image (nom du fichier sans .png) ; un tableau = une image au hasard
  static symbol = null;     // caractère qui place cette entité dans map.js
  static hp = Infinity;     // points de vie (Infinity = invincible)
  static speed = 0;         // vitesse en pixels/seconde
  static solid = false;     // true = bloque et est bloqué par les autres objets solides

  constructor(scene, x, y) {
    const C = new.target;
    const image = Array.isArray(C.sprite) ? Phaser.Utils.Array.GetRandom(C.sprite) : C.sprite;
    super(scene, x, y, image);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.entities.add(this);
    this.hp = C.hp;
    this.speed = C.speed;
    this.solid = C.solid;
    this.setDepth(C.solid ? 10 : 5);
    // hitbox ronde centrée (F1 pour la voir)
    const r = Math.min(this.width, this.height) * 0.4;
    this.body.setCircle(r, this.width / 2 - r, this.height / 2 - r);
  }

  // ---------- HOOKS : à remplacer dans tes classes ----------
  onUpdate(dt) {}              // à chaque image (dt = secondes écoulées)
  onTouch(other) {}            // quelque chose me touche (other.isWall pour un mur)
  onInteract(player) {}        // le joueur appuie sur E à côté de moi
  onHit(damage, from) {        // je reçois des dégâts (balle, voiture…)
    this.hp -= damage;
    if (this.hp <= 0) this.onDeath(from);
  }
  onDeath(from) { this.destroy(); }   // mes points de vie tombent à 0

  // ---------- OUTILS ----------
  distanceTo(other) { return Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y); }
  angleTo(other) { return Phaser.Math.Angle.Between(this.x, this.y, other.x, other.y); }
  moveAngle(angle, speed = this.speed) {   // avance dans une direction (radians) en la regardant
    this.rotation = angle;
    this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
  }
  moveToward(other, speed = this.speed) { this.moveAngle(this.angleTo(other), speed); }
  stop() { this.body.setVelocity(0, 0); }
}
