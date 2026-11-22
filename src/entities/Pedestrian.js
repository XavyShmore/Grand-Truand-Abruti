import * as Phaser from 'phaser';
import Entity from '../Entity.js';
import Cash from './Cash.js';

// Un piéton : se promène, s'enfuit quand ça tire, laisse parfois de l'argent.
export default class Pedestrian extends Entity {
  static sprite = ['pedestrian1', 'pedestrian2', 'pedestrian3'];
  static symbol = 'p';
  static hp = 20;
  static speed = 60;
  static solid = true;

  nextTurn = 0;
  scaredUntil = 0;

  onUpdate(dt) {
    const now = this.scene.time.now;
    const player = this.scene.player;
    // le joueur vient de tirer près de moi ? j'ai peur 3 secondes
    if (now - player.lastShot < 300 && this.distanceTo(player) < 400) this.scaredUntil = now + 3000;

    if (now < this.scaredUntil) {
      this.moveAngle(player.angleTo(this), this.speed * 3);   // fuir
    } else if (now > this.nextTurn) {
      this.nextTurn = now + Phaser.Math.Between(1500, 4000);
      this.moveAngle(Math.random() * Math.PI * 2);            // nouvelle direction au hasard
    }
  }

  onTouch(other) {
    if (other.isWall) this.nextTurn = 0;   // un mur ? changer de direction
  }

  onDeath(from) {
    if (from?.isPlayer) this.scene.addWanted(1);
    if (Math.random() < 0.5) new Cash(this.scene, this.x, this.y);
    this.destroy();
  }
}
