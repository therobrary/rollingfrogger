class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeSelectScene' });
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(centerX, height * 0.08, 'SELECT MODE', {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Mode card definitions
    const modes = [
      {
        id: 'classic',
        name: 'CLASSIC',
        description: 'Fill all 5 goal bays to complete each level.',
        color: 0x224466,
        hoverColor: 0x336688,
        accentColor: '#44aaff',
        iconColor: '#44aaff',
        highScoreKey: 'rollingfrogger_highscore_classic',
        bestStatsKey: 'rollingfrogger_beststats_classic',
        y: height * 0.28,
        cardWidth: 560,
        cardHeight: 100
      },
      {
        id: 'endless',
        name: 'ENDLESS',
        description: 'Cross as far as you can! Distance-based scoring with near-miss bonuses.',
        color: 0x226644,
        hoverColor: 0x338866,
        accentColor: '#44ff88',
        iconColor: '#44ff88',
        highScoreKey: 'rollingfrogger_highscore_endless',
        bestStatsKey: 'rollingfrogger_beststats_endless',
        y: height * 0.48,
        cardWidth: 560,
        cardHeight: 100
      },
      {
        id: 'bonus',
        name: 'BONUS',
        description: 'Time Trial, No Miss, Speed Run, and Zen Mode challenges.',
        color: 0x442266,
        hoverColor: 0x663388,
        accentColor: '#aa44ff',
        iconColor: '#aa44ff',
        highScoreKey: 'rollingfrogger_highscore_bonus',
        bestStatsKey: 'rollingfrogger_beststats_bonus',
        y: height * 0.68,
        cardWidth: 560,
        cardHeight: 100
      }
    ];

    this._selectedMode = null;

    modes.forEach((mode) => {
      const cardX = centerX;
      const cardY = mode.y;
      const halfW = mode.cardWidth / 2;
      const halfH = mode.cardHeight / 2;

      // Card background
      const card = this.add.rectangle(cardX, cardY, mode.cardWidth, mode.cardHeight, mode.color)
        .setInteractive({ useHandCursor: true });

      // Mode icon (colored circle)
      this.add.circle(cardX - halfW + 30, cardY, 16, parseInt(mode.iconColor.replace('#', '0x')));

      // Mode name
      this.add.text(cardX - halfW + 55, cardY - 12, mode.name, {
        fontSize: '20px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: mode.accentColor,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0, 0.5);

      // Mode description
      this.add.text(cardX - halfW + 55, cardY + 14, mode.description, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#888899',
        wordWrap: { width: mode.cardWidth - 120 }
      }).setOrigin(0, 0.5);

      // High score display
      let highScore = 0;
      let bestStats = '';
      try {
        highScore = parseInt(localStorage.getItem(mode.highScoreKey), 10) || 0;
        bestStats = localStorage.getItem(mode.bestStatsKey) || '';
      } catch (e) {}

      const hsText = highScore > 0 ? `Best: ${highScore}` : 'No score yet';
      const statsText = bestStats ? `${hsText} — ${bestStats}` : hsText;
      this.add.text(cardX + halfW - 15, cardY, statsText, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#667788',
        align: 'right'
      }).setOrigin(1, 0.5);

      // Hover effect
      card.on('pointerover', () => card.setFillStyle(mode.hoverColor));
      card.on('pointerout', () => card.setFillStyle(mode.color));
      card.on('pointerdown', () => {
        this._selectedMode = mode.id;

        if (mode.id === 'bonus') {
          this.scene.start('BonusModeScene');
        } else {
          ModeManager.setMode(mode.id);
          this.scene.start('GameScene', { mode: mode.id });
        }
      });
    });

    // Back button
    const backBtn = this.add.rectangle(centerX, height * 0.9, 140, 36, 0x224466)
      .setInteractive({ useHandCursor: true });
    this.add.text(centerX, height * 0.9, 'BACK', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#88aacc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x336688));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x224466));
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
