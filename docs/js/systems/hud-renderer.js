class HUDRenderer {

  create(scene, gameWidth, gameHeight) {
    // HUD background bar
    scene.add.rectangle(gameWidth / 2, 16, gameWidth, 32, 0x000000)
      .setAlpha(0.6)
      .setDepth(100);

    this.scoreText = scene.add.text(12, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(101);

    this.livesText = scene.add.text(gameWidth - 12, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0).setDepth(101);

    this.levelText = scene.add.text(gameWidth / 2, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(101);

    this.highScoreText = scene.add.text(gameWidth / 2, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(101);

    this.currencyText = scene.add.text(12, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(101);

    this.statusText = scene.add.text(gameWidth - 12, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#44aaff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(1, 0).setDepth(101);

    // Endless mode HUD elements (hidden by default)
    this.distanceText = scene.add.text(12, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(101).setVisible(false);

    this.comboText = scene.add.text(gameWidth / 2, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffaa44',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(101).setVisible(false);

    this.comboMultiplierText = scene.add.text(gameWidth / 2, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff8844',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(101).setVisible(false);

    // Bonus mode HUD elements (hidden by default)
    this.bonusModeText = scene.add.text(gameWidth / 2, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aa44ff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(101).setVisible(false);

    this.timeTrialText = scene.add.text(gameWidth - 12, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0).setDepth(101).setVisible(false);

    this.bonusMultiplierText = scene.add.text(gameWidth / 2, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#cc66ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(101).setVisible(false);

    this.nearMissText = scene.add.text(12, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(101).setVisible(false);

    // Zen mode indicator
    this.zenIndicator = scene.add.text(gameWidth / 2, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44aaff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(101).setVisible(false);

    // Location label at bottom
    scene.add.text(gameWidth / 2, gameHeight - 10, 'Rolling Rd x Grigsby Dr', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#444466'
    }).setOrigin(0.5).setDepth(100);

    // Pause button (top right, next to lives)
    const pauseBtnX = gameWidth - 12;
    const pauseBtnY = 8;
    this.pauseBtn = scene.add.rectangle(pauseBtnX, pauseBtnY, 28, 28, 0x333355)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);
    this._pauseBtnText = scene.add.text(pauseBtnX, pauseBtnY, 'II', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(102);
    this.pauseBtn.on('pointerover', () => this.pauseBtn.setFillStyle(0x444466));
    this.pauseBtn.on('pointerout', () => this.pauseBtn.setFillStyle(0x333355));
    this.pauseBtn.on('pointerdown', () => {
      if (this._pauseCallback) this._pauseCallback();
    });

    // Accessibility indicators (top left, below score)
    this.cbIndicator = scene.add.text(12, 44, '', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(101);

    this.motionIndicator = scene.add.text(12, 56, '', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(101);

    this.contrastIndicator = scene.add.text(12, 68, '', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(101);

    this._pauseCallback = null;
  }

  update(score, lives, level, hopsCompleted, highScore, currency, shieldActive, magnetActive, equippedCharName) {
    this.scoreText.setText(`Score: ${score}`);
    this.livesText.setText('Lives: ' + '\u2665'.repeat(Math.max(0, lives)));
    this.levelText.setText(`Level: ${level}  Progress: ${hopsCompleted}`);
    this.highScoreText.setText(`Best: ${highScore}`);
    this.currencyText.setText(`Coins: ${currency || 0}`);

    const statusParts = [];
    if (shieldActive) statusParts.push('\u25CF Shield');
    if (magnetActive) statusParts.push('\u25CF Magnet');
    if (equippedCharName) statusParts.push(`[${equippedCharName}]`);
    this.statusText.setText(statusParts.join('  '));

    // Hide endless mode elements
    this.distanceText.setVisible(false);
    this.comboText.setVisible(false);
    this.comboMultiplierText.setVisible(false);

    // Hide bonus mode elements
    this.bonusModeText.setVisible(false);
    this.timeTrialText.setVisible(false);
    this.bonusMultiplierText.setVisible(false);
    this.nearMissText.setVisible(false);
    this.zenIndicator.setVisible(false);
  }

  updateEndless(score, lives, distance, combo, highScore, currency, shieldActive, magnetActive) {
    this.scoreText.setText(`Score: ${score}`);
    this.livesText.setText('Lives: ' + '\u2665'.repeat(Math.max(0, lives)));

    // Show endless mode elements
    this.distanceText.setVisible(true);
    this.comboText.setVisible(true);
    this.comboMultiplierText.setVisible(true);

    // Hide classic mode elements
    this.levelText.setVisible(false);
    this.highScoreText.setVisible(false);
    this.currencyText.setVisible(false);
    this.statusText.setVisible(false);

    // Hide bonus mode elements
    this.bonusModeText.setVisible(false);
    this.timeTrialText.setVisible(false);
    this.bonusMultiplierText.setVisible(false);
    this.nearMissText.setVisible(false);
    this.zenIndicator.setVisible(false);

    // Update endless mode HUD
    this.distanceText.setText(`Distance: ${distance}`);
    this.comboText.setText(combo > 0 ? `COMBO x${combo}` : '');

    if (combo > 0) {
      const multiplier = 1 + (combo - 1) * GameConfig.endlessNearMissComboMultiplier;
      this.comboMultiplierText.setText(`x${multiplier.toFixed(1)} near-miss bonus`);
    } else {
      this.comboMultiplierText.setText('');
    }
  }

  updateBonus(score, lives, level, hopsCompleted, highScore, currency, shieldActive, magnetActive, equippedCharName, bonusModeId, timeTrialRemaining, nearMissCount) {
    this.scoreText.setText(`Score: ${score}`);
    this.livesText.setText(lives >= 999 ? 'Zen' : 'Lives: ' + '\u2665'.repeat(Math.max(0, lives)));

    // Show bonus mode elements
    this.bonusModeText.setVisible(true);
    this.levelText.setVisible(true);
    this.highScoreText.setVisible(false);
    this.currencyText.setVisible(false);

    // Hide endless mode elements
    this.distanceText.setVisible(false);
    this.comboText.setVisible(false);
    this.comboMultiplierText.setVisible(false);

    // Hide classic status text
    this.statusText.setVisible(false);

    // Set bonus mode label
    const modeNames = {
      time_trial: 'TIME TRIAL',
      no_miss: 'NO MISS',
      speed_run: 'SPEED RUN',
      zen_mode: 'ZEN MODE'
    };
    this.bonusModeText.setText(modeNames[bonusModeId] || 'BONUS');

    // Time Trial: show countdown timer
    if (timeTrialRemaining > 0) {
      this.timeTrialText.setVisible(true);
      this.timeTrialText.setText(`Time: ${timeTrialRemaining}s`);
    } else {
      this.timeTrialText.setVisible(false);
    }

    // Speed Run: show score multiplier
    if (bonusModeId === 'speed_run') {
      this.bonusMultiplierText.setVisible(true);
      this.bonusMultiplierText.setText(`${GameConfig.speedRunScoreMultiplier}x SCORE`);
    } else {
      this.bonusMultiplierText.setVisible(false);
    }

    // No Miss: show near miss counter
    if (bonusModeId === 'no_miss') {
      this.nearMissText.setVisible(true);
      this.nearMissText.setText(`Near Misses: ${nearMissCount || 0}`);
    } else {
      this.nearMissText.setVisible(false);
    }

    // Zen Mode: show indicator
    if (bonusModeId === 'zen_mode') {
      this.zenIndicator.setVisible(true);
      this.zenIndicator.setText('\u2728 ZEN \u2728');
    } else {
      this.zenIndicator.setVisible(false);
    }
  }

  updateNearMissCount(count) {
    if (this.nearMissText.visible) {
      this.nearMissText.setText(`Near Misses: ${count}`);
    }
  }

  setPauseCallback(callback) {
    this._pauseCallback = callback;
  }

  updateAccessibilityIndicators(cbMode, reducedMotion, highContrast) {
    if (cbMode && cbMode !== 'none') {
      const modeNames = { deuteranopia: 'DC', tritanopia: 'TC', achromatopsia: 'AC' };
      this.cbIndicator.setText(`CB: ${modeNames[cbMode] || cbMode}`);
      this.cbIndicator.setVisible(true);
    } else {
      this.cbIndicator.setVisible(false);
    }

    if (reducedMotion) {
      this.motionIndicator.setText('Motion: Off');
      this.motionIndicator.setVisible(true);
    } else {
      this.motionIndicator.setVisible(false);
    }

    if (highContrast) {
      this.contrastIndicator.setText('High Contrast');
      this.contrastIndicator.setVisible(true);
    } else {
      this.contrastIndicator.setVisible(false);
    }
  }
}
