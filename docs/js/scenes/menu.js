class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Decorative stars
    for (let i = 0; i < 40; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        'star'
      );
      star.setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
      star.setScale(Phaser.Math.FloatBetween(0.5, 1.5));
    }

    // Animated title with shadow
    const title = this.add.text(width / 2, height * 0.22, 'ROLLING-FROGGER', {
      fontSize: '52px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      fontStyle: 'bold',
      stroke: '#003322',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle with road theme
    this.add.text(width / 2, height * 0.34, 'Rolling Rd x Grigsby Dr', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // School name
    this.add.text(width / 2, height * 0.42, 'West Springfield High School', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffdd44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Decorative road line
    this.add.rectangle(width / 2, height * 0.49, 200, 4, 0x444444).setOrigin(0.5);
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(
        width / 2 - 80 + i * 40,
        height * 0.49,
        16, 2, 0x666666
      ).setOrigin(0.5);
    }

    // Play button with glow
    const btnX = width / 2 - 80;
    const btnY = height * 0.62;
    const playBtn = this.add.image(btnX + 80, btnY, 'btn_play').setInteractive({ useHandCursor: true });

    const playText = this.add.text(btnX + 80, btnY, 'PLAY', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Button hover effects
    playBtn.on('pointerover', () => {
      playBtn.setTexture('btn_play_hover');
      this.cameras.main.tweens.add({
        targets: playText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });
    playBtn.on('pointerout', () => {
      playBtn.setTexture('btn_play');
      this.cameras.main.tweens.add({
        targets: playText,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    playBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Instructions panel
    const instrY = height * 0.78;

    this.add.text(width / 2, instrY, 'How to Play', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888899',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, instrY + 28, 'Arrow Keys or WASD to move', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#666677'
    }).setOrigin(0.5);

    this.add.text(width / 2, instrY + 50, 'Navigate through traffic to reach the school', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#555566'
    }).setOrigin(0.5);

    this.add.text(width / 2, instrY + 72, 'Use safe zones (median, grass, sidewalk) to plan your route', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#444455'
    }).setOrigin(0.5);

    // Footer
    this.add.text(width / 2, height - 20, 'A game about crossing Rolling Rd safely', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#333344'
    }).setOrigin(0.5);
  }
}
