import Entity from '../Entity.js';

// De l'argent à ramasser.
export default class Cash extends Entity {
  static sprite = 'cash';
  static symbol = '$';

  onTouch(other) {
    if (!other.isPlayer) return;
    other.money += 50;
    this.scene.sound.play('coin');
    this.destroy();
  }
}
