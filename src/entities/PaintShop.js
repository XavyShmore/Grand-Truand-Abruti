import * as Phaser from 'phaser';
import Entity from '../Entity.js';
import Car from './Car.js';

// Atelier de peinture : y entrer en voiture repeint la voiture et efface les étoiles (100 $).
export default class PaintShop extends Entity {
  static sprite = 'paint_shop';
  static symbol = 'S';

  constructor(scene, x, y) {
    super(scene, x, y);
    this.setDepth(-5);   // dessiné sous les voitures
  }

  onTouch(other) {
    const player = other.driver;
    if (!player?.isPlayer || this.scene.wanted === 0) return;
    if (player.money < 100) return this.scene.say('Peinture : 100 $. Reviens avec de l\'argent !');
    player.money -= 100;
    this.scene.wanted = 0;
    other.setTexture(Phaser.Utils.Array.GetRandom(Car.sprite));
    this.scene.say('Peinture fraîche ! La police ne te reconnaît plus.');
    this.scene.sound.play('coin');
  }
}
