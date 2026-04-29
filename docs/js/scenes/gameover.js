class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.won = data.won || false;
    this.score = data.score || 0;
    this.level = data.level || 1;
    this.bonusMode = data.bonusMode || null;
    this.noMissFail = data.noMissFail || false;
    AchievementManager.saveAchievements();
    try {
      const modeKey = this.bonusMode
        ? `rollingfrogger_bonus_highscore_${this.bonusMode}`
        : ModeManager.getHighScoreKey(ModeManager.getMode());
      this.highScore = parseInt(localStorage.getItem(modeKey), 10) || 0;
    } catch(e) {
      this.highScore = 0;
    }
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    const centerX = width / 2;
    const centerY = height / 2;

    // Title
    const titleText = this.won ? 'YOU MADE IT!' : 'GAME OVER';
    const titleColor = this.won ? '#44ff88' : '#ff4444';

    this.add.text(centerX, centerY - 90, titleText, {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Score display
    this.add.text(centerX, centerY - 25, `Final Score`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888899'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 10, `${this.score}`, {
      fontSize: '40px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Bonus mode label
    if (this.bonusMode) {
      const bonusNames = {
        time_trial: 'TIME TRIAL',
        no_miss: 'NO MISS',
        speed_run: 'SPEED RUN',
        zen_mode: 'ZEN MODE'
      };
      this.add.text(centerX, centerY - 50, bonusNames[this.bonusMode] || 'BONUS MODE', {
        fontSize: '16px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#aa44ff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Level reached
    this.add.text(centerX, centerY + 50, `Reached Level ${this.level}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffdd44'
    }).setOrigin(0.5);

    // High score
    const isNewHigh = this.score >= this.highScore && this.score > 0;
    this.add.text(centerX, centerY + 75, `Best: ${this.highScore}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: isNewHigh ? '#44ff88' : '#888899'
    }).setOrigin(0.5);
    if (isNewHigh) {
      const highScoreTextY = this.won ? centerY + 95 : centerY + 105;
      this.add.text(centerX, highScoreTextY, 'NEW HIGH SCORE!', {
        fontSize: '16px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#44ff88',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Subtitle based on outcome
    if (this.won) {
      this.add.text(centerX, centerY + 85, 'You safely reached West Springfield High School!', {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#44ff88',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    } else if (this.noMissFail) {
      const subtitleY = centerY + (isNewHigh ? 115 : 85);
      this.add.text(centerX, subtitleY, 'Near miss detected! Try again without any.', {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ff6666',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    } else {
      const subtitleY = centerY + (isNewHigh ? 115 : 85);
      this.add.text(centerX, subtitleY, 'Traffic on Rolling Rd is no joke!', {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ff6666',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.add.text(centerX, subtitleY + 25, 'Use the safe zones wisely on your next try', {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#888899'
      }).setOrigin(0.5);
    }

    // Restart button
    const btnX = centerX - 80;
    const btnY = centerY + 160;
    const restartBtn = this.add.image(btnX + 80, btnY, 'btn_play').setInteractive({ useHandCursor: true });

    const restartText = this.add.text(btnX + 80, btnY, 'PLAY AGAIN', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    restartBtn.on('pointerover', () => {
      restartBtn.setTexture('btn_play_hover');
    });
    restartBtn.on('pointerout', () => {
      restartBtn.setTexture('btn_play');
    });
    restartBtn.on('pointerdown', () => {
      if (this.bonusMode) {
        this.scene.start('GameScene', { mode: 'bonus', bonusModeId: this.bonusMode });
      } else {
        this.scene.start('GameScene');
      }
    });

    // Menu button
    const menuBtn = this.add.image(btnX + 80, btnY + 60, 'btn_play').setInteractive({ useHandCursor: true });
    const menuText = this.add.text(btnX + 80, btnY + 60, 'MAIN MENU', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => {
      menuBtn.setTexture('btn_play_hover');
    });
    menuBtn.on('pointerout', () => {
      menuBtn.setTexture('btn_play');
    });
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
