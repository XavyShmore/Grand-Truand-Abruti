import * as Phaser from 'phaser';
import Entity from '../Entity.js';

// Une voiture : E pour monter/descendre, W/S accélérer/reculer, A/D tourner, ESPACE frein à main (dérapage).
export default class Car extends Entity {
  static sprite = ['car_red', 'car_blue', 'car_yellow', 'car_green'];
  static symbol = 'C';
  static hp = 100;
  static speed = 500;   // vitesse maximale
  static solid = true;

  accel = 400;          // accélération
  turnRate = 3;         // vitesse de rotation
  grip = 0.9;           // adhérence (plus bas = plus de dérapage)
  driver = null;
  lastSpeed = 0;

  constructor(scene, x, y) {
    super(scene, x, y);
    this.setDepth(20);
    this.body.setSize(60, 60).setMass(5);   // hitbox carrée (Arcade ne fait pas tourner les hitbox)
  }

  onInteract(player) {
    if (this.hp <= 0) return this.scene.say('Cette voiture est détruite.');
    this.driver = player;
    player.car = this;
    player.setVisible(false).body.enable = false;
    this.scene.sound.play('door');
  }

  exit() {
    const p = this.driver;
    this.driver = null;
    p.car = null;
    p.setVisible(true).body.enable = true;
    p.setPosition(this.x + Math.cos(this.rotation + 1.57) * 60, this.y + Math.sin(this.rotation + 1.57) * 60);
    this.scene.sound.play('door');
  }

  onUpdate(dt) {
    this.lastSpeed = this.body.speed;
    const k = this.scene.keys;
    const driving = this.driver?.isPlayer && this.hp > 0;
    const throttle = driving ? k.W.isDown - k.S.isDown : 0;
    const steer = driving ? k.D.isDown - k.A.isDown : 0;
    const grip = driving && k.SPACE.isDown ? 0.99 : this.grip;

    // vitesse vers l'avant et vers le côté
    const fwd = new Phaser.Math.Vector2().setToPolar(this.rotation);
    const side = new Phaser.Math.Vector2().setToPolar(this.rotation + Math.PI / 2);
    let forward = this.body.velocity.dot(fwd);
    let lateral = this.body.velocity.dot(side);

    forward += throttle * this.accel * dt;
    if (!throttle) forward *= 0.98;   // ralentit tout seul
    forward = Phaser.Math.Clamp(forward, -this.speed / 3, this.speed);
    lateral *= grip;
    this.rotation += steer * this.turnRate * dt * Phaser.Math.Clamp(forward / 200, -1, 1);

    fwd.setToPolar(this.rotation);
    side.setToPolar(this.rotation + Math.PI / 2);
    this.body.velocity.set(fwd.x * forward + side.x * lateral, fwd.y * forward + side.y * lateral);
  }

  onTouch(other) {
    if (this.lastSpeed < 150) return;
    other.onHit?.(this.lastSpeed / 10, this.driver ?? this);   // écraser fait mal
    if (other.isWall || other instanceof Car) this.onHit(this.lastSpeed / 50, other);
    this.lastSpeed = 0;
  }

  onDeath() {
    if (this.wrecked) return;
    this.wrecked = true;
    this.setTint(0x333333);
    this.scene.sound.play('explosion');
    this.scene.cameras.main.shake(300, 0.01);
    if (this.driver) { const p = this.driver; this.exit(); p.onHit(30, this); }
  }
}
