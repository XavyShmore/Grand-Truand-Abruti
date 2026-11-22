import Entity from '../Entity.js';
import PoliceCar from './PoliceCar.js';

// Un PNJ qui donne une mission : lui ramener une voiture de police.
// Une mission = un état (this.step) qu'on fait avancer dans onInteract et onUpdate.
export default class MissionGiver extends Entity {
  static sprite = 'old_man';
  static symbol = 'M';
  static solid = true;

  step = 0;

  constructor(scene, x, y) {
    super(scene, x, y);
    this.body.setImmovable(true);   // on ne peut pas le pousser
  }

  onInteract(player) {
    if (this.step === 0) {
      this.scene.say('Le vieux : « Ramène-moi une voiture de police.\nJe te donne 500 $. »', 5000);
      this.step = 1;
    } else if (this.step === 1) {
      this.scene.say('Le vieux : « Alors, cette voiture de police ? »');
    } else {
      this.scene.say('Le vieux : « Merci encore, petit. »');
    }
  }

  onUpdate(dt) {
    const car = this.scene.player.car;
    if (this.step === 1 && car instanceof PoliceCar && this.distanceTo(car) < 200) {
      this.scene.player.money += 500;
      this.scene.say('Mission réussie ! +500 $', 4000);
      this.scene.sound.play('coin');
      this.step = 2;
    }
  }
}
