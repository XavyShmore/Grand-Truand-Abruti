import Entity from '../Entity.js';

// Une balle. Pas de symbole : on la crée en code avec new Bullet(scene, x, y, angle, tireur).
export default class Bullet extends Entity {
  static sprite = 'bullet';
  static speed = 900;
  damage = 20;

  constructor(scene, x, y, angle, owner) {
    super(scene, x, y);
    this.owner = owner;
    this.moveAngle(angle);
    scene.sound.play('shoot', { volume: 0.3 });
    scene.time.delayedCall(1000, () => this.destroy());   // disparaît après 1 s
  }

  onTouch(other) {
    if (other === this.owner || other.driver === this.owner) return;   // pas sur soi-même
    if (!other.isWall && !other.solid) return;                         // traverse l'argent, etc.
    other.onHit?.(this.damage, this.owner);
    this.scene.sound.play('hit', { volume: 0.3 });
    this.destroy();
  }
}
