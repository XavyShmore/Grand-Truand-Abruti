import * as Phaser from 'phaser';
import GameScene from './GameScene.js';
import Hud from './Hud.js';

// window.game : accessible dans la console du navigateur (F12) pour déboguer
window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1b1b1b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [GameScene, Hud],
});
