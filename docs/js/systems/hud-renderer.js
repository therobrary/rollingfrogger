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

    // Location label at bottom
    scene.add.text(gameWidth / 2, gameHeight - 10, 'Rolling Rd x Grigsby Dr', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#444466'
    }).setOrigin(0.5).setDepth(100);
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
}
