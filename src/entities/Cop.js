import Entity from '../Entity.js';
import Bullet from './Bullet.js';
import GunPickup from './GunPickup.js';

// Un policier : poursuit et tire sur le joueur quand il a des étoiles.
// GameScene en fait apparaître 2 par étoile.
export default class Cop extends Entity {
  static sprite = 'cop';
  static symbol = 'K';
  static hp = 40;
  static speed = 150;
  static solid = true;

  lastShot = 0;

  onUpdate(dt) {
    const target = this.scene.player.car ?? this.scene.player;
    if (this.scene.wanted === 0) return this.stop();   // rien à signaler

    const distance = this.distanceTo(target);
    if (distance > 250) this.moveToward(target);
    else { this.stop(); this.rotation = this.angleTo(target); }

    const now = this.scene.time.now;
    if (distance < 450 && now - this.lastShot > 1500) {
      this.lastShot = now;
      const bullet = new Bullet(this.scene, this.x, this.y, this.rotation, this);
      bullet.damage = 5;
    }
  }

  onDeath(from) {
    if (from?.isPlayer) this.scene.addWanted(1);
    if (Math.random() < 0.3) new GunPickup(this.scene, this.x, this.y);
    this.destroy();
  }
}
