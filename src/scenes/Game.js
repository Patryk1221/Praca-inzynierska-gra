import Phaser from 'phaser';
import Hero from '../entities/Hero';

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {}

  preload() {
    this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json');
    this.load.spritesheet('world-1-sheet', 'assets/tilesets/world-1.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });
    this.load.image('clouds-sheet', 'assets/tilesets/clouds.png');


    this.load.spritesheet('hero-run-sheet', 'assets/hero/run.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-idle-sheet', 'assets/hero/idle.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-pivot-sheet', 'assets/hero/pivot.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-jump-sheet', 'assets/hero/jump.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-flip-sheet', 'assets/hero/spinjump.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-fall-sheet', 'assets/hero/fall.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('hero-die-sheet', 'assets/hero/bonk.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
  }

  create(data) {

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.createAnimations();

    this.addMap();

    this.addHero();

    this.setCamera();
  }

  createAnimations() {
    this.anims.create({
      key: 'hero-idle',
      frames: this.anims.generateFrameNumbers('hero-idle-sheet'),
    });
    this.anims.create({
      key: 'hero-running',
      frames: this.anims.generateFrameNumbers('hero-run-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-pivoting',
      frames: this.anims.generateFrameNumbers('hero-pivot-sheet'),
    });
    this.anims.create({
      key: 'hero-jumping',
      frames: this.anims.generateFrameNumbers('hero-jump-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-flipping',
      frames: this.anims.generateFrameNumbers('hero-flip-sheet'),
      frameRate: 30,
    });
    this.anims.create({
      key: 'hero-falling',
      frames: this.anims.generateFrameNumbers('hero-fall-sheet'),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'hero-dead',
      frames: this.anims.generateFrameNumbers('hero-die-sheet'),
    });
  }

  setCamera() {
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }
  
  addHero() {
    this.hero = new Hero(this, this.startPoint.x, this.startPoint.y+1);
    
    this.cameras.main.startFollow(this.hero);

    this.children.moveTo(this.hero, this.children.getIndex(this.map.getLayer('Foreground').tilemapLayer));
    
    const groundCollider = this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer);

    const spikesCollider = this.physics.add.overlap(this.hero, this.spikesGroup, () => {
      this.hero.killHero();
    });
    
    this.hero.on('heroDied', () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();
    })
  }

  addMap() {
    this.map = this.make.tilemap({key: 'level-1'});
    const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
    const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');

    const backgroundLayer = this.map.createStaticLayer('Background', backgroundTiles);
    backgroundLayer.setScrollFactor(0.5);

    // ground
    this.groundLayer = this.map.createDynamicLayer('Ground', groundTiles);
    this.groundLayer.setCollisionByProperty({ collides: true, }, true);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBoundsCollision(true,true,false,true);

    this.startPoint = this.map.getObjectLayer('Start').objects[0];
    
    let spikes = this.map.getObjectLayer('Spikes').objects;
    this.spikesGroup = this.physics.add.group({immovable: true, allowGravity: false});

    spikes.forEach(s => {
      let spike = this.spikesGroup.create(s.x, s.y, 'world-1-sheet', s.gid - 1);
      spike.setOrigin(0, 1);
      spike.setSize(s.width-10, s.height-8);
      spike.setOffset(5, 8);
    })

    
    this.map.createStaticLayer('Foreground', groundTiles);

    // const graphicDebug = this.add.graphics();
    // this.groundLayer.renderDebug(graphicDebug);
  }

  update(time, delta) {
    const cameraBottomPosition = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;

    if(this.hero.isHeroDead() && this.hero.getBounds().top > cameraBottomPosition+100) {
      this.hero.destroy();
      this.addHero();
    }
  }
}

export default Game;