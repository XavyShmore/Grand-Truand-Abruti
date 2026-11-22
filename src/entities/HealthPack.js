import Entity from '../Entity.js';

// Une trousse de soin : +50 de vie (maximum 100).
export default class HealthPack extends Entity {
  static sprite = 'health';
  static symbol = '+';

  onTouch(other) {
    if (!other.isPlayer || other.hp >= 100) return;
    other.hp = Math.min(100, other.hp + 50);
    this.scene.sound.play('coin');
    this.destroy();
  }
}
