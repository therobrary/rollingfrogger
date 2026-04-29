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
    const btnY = height * 0.58;
    const playBtn = this.add.image(btnX + 80, btnY, 'btn_play').setInteractive({ useHandCursor: true });

    const playText = this.add.text(btnX + 80, btnY, 'PLAY', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Mode selection buttons
    const modeBtnY = height * 0.72;
    const modeBtnWidth = 160;
    const modeBtnHeight = 36;
    const classicBtnX = width / 2 - modeBtnWidth / 2;
    const endlessBtnX = width / 2 + modeBtnWidth / 2 - 10;

    ModeManager.init();
    this._selectedMode = ModeManager.getMode();

    // Classic mode button
    this._classicBtn = this.add.rectangle(classicBtnX + modeBtnWidth / 2, modeBtnY, modeBtnWidth, modeBtnHeight, 0x224466)
      .setInteractive({ useHandCursor: true });
    this._classicBtnText = this.add.text(classicBtnX + modeBtnWidth / 2, modeBtnY, 'CLASSIC', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: this._selectedMode === 'classic' ? '#44ff88' : '#88aacc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this._classicBtn.on('pointerover', () => this._classicBtn.setFillStyle(0x336688));
    this._classicBtn.on('pointerout', () => this._classicBtn.setFillStyle(this._selectedMode === 'classic' ? 0x226644 : 0x224466));
    this._classicBtn.on('pointerdown', () => this._selectMode('classic'));

    // Endless mode button
    this._endlessBtn = this.add.rectangle(endlessBtnX + modeBtnWidth / 2, modeBtnY, modeBtnWidth, modeBtnHeight, 0x224466)
      .setInteractive({ useHandCursor: true });
    this._endlessBtnText = this.add.text(endlessBtnX + modeBtnWidth / 2, modeBtnY, 'ENDLESS', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: this._selectedMode === 'endless' ? '#44ff88' : '#88aacc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this._endlessBtn.on('pointerover', () => this._endlessBtn.setFillStyle(0x336688));
    this._endlessBtn.on('pointerout', () => this._endlessBtn.setFillStyle(this._selectedMode === 'endless' ? 0x226644 : 0x224466));
    this._endlessBtn.on('pointerdown', () => this._selectMode('endless'));

    // Mode description text
    this._modeDescription = this.add.text(width / 2, modeBtnY + 35, ModeManager.getModeDescription(this._selectedMode), {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#667788',
      align: 'center'
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
      this.scene.start('GameScene', { mode: this._selectedMode });
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

  _selectMode(mode) {
    this._selectedMode = mode;
    ModeManager.setMode(mode);

    // Update classic button
    this._classicBtn.setFillStyle(mode === 'classic' ? 0x226644 : 0x224466);
    this._classicBtnText.setColor(mode === 'classic' ? '#44ff88' : '#88aacc');

    // Update endless button
    this._endlessBtn.setFillStyle(mode === 'endless' ? 0x226644 : 0x224466);
    this._endlessBtnText.setColor(mode === 'endless' ? '#44ff88' : '#88aacc');

    // Update description
    this._modeDescription.setText(ModeManager.getModeDescription(mode));
  }
}
