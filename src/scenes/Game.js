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
    this.load.spritesheet('gems-sheet', 'assets/tilesets/gems.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 5,
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

    this.addGems();

    this.addHero();

    this.setCamera();
    
    this.addTimer();
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

    const gemsCollider = this.physics.add.overlap(this.hero, this.gemsGroup, (hero, gem) => {
      this.gemsGroup.remove(gem, true, true);
      let children = this.gemsGroup.getChildren();

      if(children.length == 0) {
        this.hero.killHero();
      }
    });
    
    this.hero.on('heroDied', () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      gemsCollider.destroy();
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

  addGems() {
    const gemsTiles = this.map.addTilesetImage('gems', 'gems-sheet');

    let gems = this.map.getObjectLayer('Gems').objects;
    this.gemsGroup = this.physics.add.group({immovable: true, allowGravity: false});

    gems.forEach(s => {
      let spike = this.gemsGroup.create(s.x, s.y, 'gems-sheet', s.gid - 1);
      spike.setOrigin(0, 1);
      spike.setSize(s.width-10, s.height-8);
      spike.setOffset(5, 8);
    })
  }

  addTimer() {
    this.startTime = this.time.now;
    this.elapsedTimeText = this.add.text(10, 10, 'Czas: 0', {fontSize: '16px', fill: '#ffffff', stroke: "#000", strokeThickness: 3 });
    this.elapsedTimeText.setScrollFactor(0);
  }

  updateTimer() {
    let elapsedTime = this.time.now - this.startTime;
    elapsedTime /= 1000;
    let minutes = Math.floor(elapsedTime / 60);
    let seconds = Math.floor(elapsedTime - (minutes * 60)).toString();
    if(seconds.length == 1) seconds = '0' + seconds;
    this.elapsedTimeText.setText(`Czas: ${minutes}:${seconds}`);
  }

  update(time, delta) {
    const cameraBottomPosition = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;
    this.updateTimer();

    if(this.hero.isHeroDead() && this.hero.getBounds().top > cameraBottomPosition+100) {
      this.hero.destroy();
      this.gemsGroup.destroy(true, true);
      this.addGems();
      this.addHero();
      this.startTime = this.time.now;
    }
  }
}

export default Game;