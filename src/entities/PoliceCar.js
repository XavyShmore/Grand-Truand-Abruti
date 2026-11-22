import Car from './Car.js';

// Une voiture de police : plus rapide, mais la voler donne 2 étoiles.
// Exemple d'héritage : on garde tout de Car et on change seulement ce qui diffère.
export default class PoliceCar extends Car {
  static sprite = 'police_car';
  static symbol = 'B';
  static speed = 650;

  onInteract(player) {
    super.onInteract(player);
    if (this.hp > 0) this.scene.addWanted(2);
  }
}
