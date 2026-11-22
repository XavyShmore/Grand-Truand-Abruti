import * as Phaser from 'phaser';

// Interface par-dessus le jeu : vie, argent, munitions, étoiles, messages.
export default class Hud extends Phaser.Scene {
  constructor() { super('hud'); }

  create() {
    const style = { fontFamily: 'monospace', fontSize: 24, color: '#ffffff', stroke: '#000000', strokeThickness: 5 };
    this.stats = this.add.text(16, 16, '', style);
    this.stars = this.add.text(1280 - 16, 172, '', { ...style, color: '#ffd23f', fontSize: 30 }).setOrigin(1, 0);
    this.message = this.add.text(640, 600, '', { ...style, fontSize: 30, align: 'center' }).setOrigin(0.5);
    this.add.rectangle(1280 - 116, 91, 202, 152).setStrokeStyle(3, 0xffffff);   // cadre de la minimap
  }

  say(text, ms = 3000) {
    this.message.setText(text);
    this.timer?.remove();
    this.timer = this.time.delayedCall(ms, () => this.message.setText(''));
  }

  update() {
    const game = this.scene.get('game');
    const p = game.player;
    if (!p) return;
    this.stats.setText(`Vie ${Math.max(0, Math.ceil(p.hp))}   $${p.money}   Balles ${p.ammo}`);
    this.stars.setText('★'.repeat(game.wanted) + '☆'.repeat(5 - game.wanted));
  }
}
