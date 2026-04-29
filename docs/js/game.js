// Rolling-Frogger - Main Game Configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 640,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    ModeSelectScene,
    BonusModeScene,
    CharacterSelectScene,
    AchievementListScene,
    GameScene,
    GameOverScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);
