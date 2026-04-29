class BonusModeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BonusModeScene' });
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(centerX, height * 0.08, 'BONUS MODES', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aa44ff',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Get bonus modes
    BonusManager.init();
    const modes = BonusManager.getBonusModes();

    modes.forEach((mode, index) => {
      const cardY = height * 0.22 + index * (height * 0.15);
      const cardWidth = 500;
      const cardHeight = 80;
      const cardX = centerX;
      const halfW = cardWidth / 2;
      const halfH = cardHeight / 2;

      // Card background
      const card = this.add.rectangle(cardX, cardY, cardWidth, cardHeight, 0x2a1a3e)
        .setInteractive({ useHandCursor: true });

      // Mode icon (colored circle)
      const iconColor = parseInt(mode.color.replace('#', '0x'));
      this.add.circle(cardX - halfW + 25, cardY, 12, iconColor);

      // Mode name
      this.add.text(cardX - halfW + 45, cardY - 10, mode.name, {
        fontSize: '18px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: mode.color,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0, 0.5);

      // Mode description
      this.add.text(cardX - halfW + 45, cardY + 12, mode.description, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#776688',
        wordWrap: { width: cardWidth - 160 }
      }).setOrigin(0, 0.5);

      // High score
      const hsText = mode.highScore > 0 ? `Best: ${mode.highScore}` : 'No score yet';
      this.add.text(cardX + halfW - 10, cardY, hsText, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#554466',
        align: 'right'
      }).setOrigin(1, 0.5);

      // Hover effect
      card.on('pointerover', () => card.setFillStyle(0x3a2a4e));
      card.on('pointerout', () => card.setFillStyle(0x2a1a3e));
      card.on('pointerdown', () => {
        this.scene.start('GameScene', { mode: 'bonus', bonusModeId: mode.id });
      });
    });

    // Back button
    const backBtn = this.add.rectangle(centerX, height * 0.88, 140, 36, 0x224466)
      .setInteractive({ useHandCursor: true });
    this.add.text(centerX, height * 0.88, 'BACK', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#88aacc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x336688));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x224466));
    backBtn.on('pointerdown', () => {
      this.scene.start('ModeSelectScene');
    });
  }
}
