import * as Phaser from 'phaser';
import MAP, { TILES } from './map.js';
import Cop from './entities/Cop.js';

// Chargement automatique : images, sons et polices de src/assets + toutes les classes de src/entities.
const ASSETS = import.meta.glob('./assets/**/*.{png,jpg,ogg,mp3,wav,ttf,otf}', { eager: true, query: '?url', import: 'default' });
const CLASSES = Object.values(import.meta.glob('./entities/*.js', { eager: true })).map((m) => m.default);

const TILE = 64;

export default class GameScene extends Phaser.Scene {
  constructor() { super('game'); }

  preload() {
    for (const [path, url] of Object.entries(ASSETS)) {
      const key = path.split('/').pop().replace(/\.\w+$/, '');   // assets/sprites/cash.png → 'cash'
      if (/\.(png|jpg)$/.test(path)) this.load.image(key, url);
      else if (/\.(ttf|otf)$/.test(path)) this.load.font(key, url);   // fontFamily: 'kenpixel'
      else this.load.audio(key, url);
    }
  }

  create() {
    this.entities = this.add.group();
    this.walls = this.physics.add.staticGroup();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,R,SPACE,F1');
    this.wanted = 0;          // étoiles de police (0 à 5)
    this.lastCrime = 0;
    this.started = this.dead = false;
    this.buildMap();

    // Collisions : murs contre tout, et entités entre elles.
    this.physics.add.collider(this.entities, this.walls, (e, wall) => e.onTouch(wall));
    this.physics.add.collider(this.entities, this.entities, null, (a, b) => {
      a.onTouch(b);
      b.onTouch(a);
      return a.solid && b.solid;   // seuls deux objets solides se repoussent
    });

    // Caméra qui suit le joueur + minimap (une 2e caméra dézoomée)
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH).startFollow(this.player, true, 0.15, 0.15);
    this.cameras.add(1280 - 216, 16, 200, 150).setZoom(0.1).startFollow(this.player).setBackgroundColor(0x000000);

    this.scene.launch('hud');
    this.startScreen();
  }

  buildMap() {
    const bySymbol = Object.fromEntries(CLASSES.filter((C) => C.symbol).map((C) => [C.symbol, C]));
    const rows = MAP.trim().split('\n');
    this.worldW = rows[0].length * TILE;
    this.worldH = rows.length * TILE;
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    rows.forEach((row, ty) => [...row].forEach((ch, tx) => {
      const x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2;
      let tile = TILES[ch];
      if (!tile) {                                 // c'est une entité : sol = case de gauche
        const Class = bySymbol[ch];
        if (!Class) throw new Error(`map.js : symbole inconnu « ${ch} » (ligne ${ty + 1} de la carte). Symboles connus : ${Object.keys(TILES).join(' ')} ${Object.keys(bySymbol).join(' ')}`);
        const obj = new Class(this, x, y);
        if (obj.isPlayer) this.player = obj;
        const left = TILES[row[tx - 1]];
        tile = left && !left.wall ? left : TILES[','];
      }
      if (tile.wall) this.walls.create(x, y, tile.image).setDepth(-10).isWall = true;
      else this.add.image(x, y, tile.image).setDepth(-10);
    }));
    if (!this.player) throw new Error('map.js : il faut un joueur (P) sur la carte !');
  }

  startScreen() {
    this.physics.pause();
    const text = this.add.text(640, 360, 'GRAND TRUAND ABRUTI\n\nCliquez pour jouer', {
      fontFamily: 'monospace', fontSize: 40, color: '#fff', align: 'center', stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.input.once('pointerdown', () => { text.destroy(); this.physics.resume(); this.started = true; });
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.F1)) this.toggleDebug();
    if (this.dead && Phaser.Input.Keyboard.JustDown(this.keys.R)) return this.scene.restart();
    if (!this.started || this.dead) return;

    const dt = delta / 1000;
    for (const e of [...this.entities.getChildren()]) if (e.active) e.onUpdate(dt);

    // Police : les étoiles baissent après 15 s sans crime…
    if (this.wanted > 0 && time - this.lastCrime > 15000) { this.wanted--; this.lastCrime = time; }
    // …et il apparaît 2 policiers par étoile, hors de l'écran.
    const cops = this.entities.getChildren().filter((e) => e instanceof Cop).length;
    if (cops < this.wanted * 2 && Math.random() < 0.02) {
      const angle = Math.random() * Math.PI * 2;
      const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * 800, 100, this.worldW - 100);
      const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * 800, 100, this.worldH - 100);
      new Cop(this, x, y);
    }
  }

  // ---------- OUTILS pour les entités : this.scene.addWanted(1), this.scene.say('...') ----------
  addWanted(stars) {
    this.wanted = Phaser.Math.Clamp(this.wanted + stars, 0, 5);
    this.lastCrime = this.time.now;
    if (stars > 0) this.sound.play('wanted', { volume: 0.5 });
  }

  say(text, ms = 3000) { this.scene.get('hud').say(text, ms); }

  gameOver() {
    this.dead = true;
    this.physics.pause();
    this.say('T\'ES MORT\nAppuie sur R pour recommencer', 999999);
  }

  toggleDebug() {
    const world = this.physics.world;
    world.drawDebug = !world.drawDebug;
    if (!world.debugGraphic) world.createDebugGraphic().setDepth(100);
    world.debugGraphic.clear().setVisible(world.drawDebug);
  }
}
