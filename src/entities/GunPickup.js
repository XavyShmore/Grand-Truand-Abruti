import Entity from '../Entity.js';

// Un pistolet au sol : +30 balles.
export default class GunPickup extends Entity {
  static sprite = 'gun';
  static symbol = 'g';

  onTouch(other) {
    if (!other.isPlayer) return;
    other.ammo += 30;
    this.scene.say('+30 balles');
    this.scene.sound.play('coin');
    this.destroy();
  }
}
