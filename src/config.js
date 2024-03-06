import Phaser from 'phaser';

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#33A5E7',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 900},
      debug: false,
      debugShowVelocity: true,
      debugShowBody: true,
      debugShowStaticBody: true,
    }
  },
  render: {
    pixelArt: true,
  },
  scale: {
    width: 500,
    height: 320,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    noAudio: true,
  }
};
