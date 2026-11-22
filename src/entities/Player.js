import * as Phaser from 'phaser';
import Entity from '../Entity.js';
import Bullet from './Bullet.js';

// Le joueur : WASD pour marcher, souris pour viser, clic pour tirer, E pour interagir ou monter en voiture.
export default class Player extends Entity {
  static sprite = 'player';
  static symbol = 'P';
  static hp = 100;
  static speed = 220;
  static solid = true;

  isPlayer = true;
  money = 0;
  ammo = 30;
  car = null;         // la voiture que je conduis
  lastShot = 0;

  onUpdate(dt) {
    const k = this.scene.keys;
    if (Phaser.Input.Keyboard.JustDown(k.E)) this.interact();
    if (this.car) return this.setPosition(this.car.x, this.car.y);   // la voiture se conduit elle-même

    // Marcher
    const dir = new Phaser.Math.Vector2(k.D.isDown - k.A.isDown, k.S.isDown - k.W.isDown).normalize();
    this.body.setVelocity(dir.x * this.speed, dir.y * this.speed);

    // Viser et tirer
    const mouse = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
    this.rotation = this.angleTo(mouse);
    const now = this.scene.time.now;
    if (this.scene.input.activePointer.isDown && this.ammo > 0 && now - this.lastShot > 200) {
      this.lastShot = now;
      this.ammo--;
      new Bullet(this.scene, this.x, this.y, this.rotation, this);
    }
  }

  interact() {
    if (this.car) return this.car.exit();
    // l'entité la plus proche (moins de 90 px) qui a un onInteract
    const near = this.scene.entities.getChildren()
      .filter((e) => e !== this && e.onInteract !== Entity.prototype.onInteract && this.distanceTo(e) < 90)
      .sort((a, b) => this.distanceTo(a) - this.distanceTo(b));
    near[0]?.onInteract(this);
  }

  onHit(damage, from) {
    super.onHit(damage, from);
    this.scene.cameras.main.shake(100, 0.005);
  }

  onDeath() {
    this.setTint(0x880000);
    this.scene.gameOver();
  }
}
