class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    let bgColor = 0x1a1a2e;
    if (typeof Accessibility !== 'undefined' && Accessibility.getHighContrast()) {
      bgColor = 0x000000;
    }
    this.add.rectangle(0, 0, width, height, bgColor).setOrigin(0);

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
    this._selectedDifficulty = ModeManager.getDifficulty();

    // Mode select button (opens full mode selection screen)
    const modeSelectBtnX = width / 2 - 60;
    const modeSelectBtnY = height * 0.645;
    const modeSelectBtn = this.add.rectangle(modeSelectBtnX + 60, modeSelectBtnY, 120, 30, 0x442266)
      .setInteractive({ useHandCursor: true });
    const modeSelectText = this.add.text(modeSelectBtnX + 60, modeSelectBtnY, 'ALL MODES', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aa44ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    modeSelectBtn.on('pointerover', () => modeSelectBtn.setFillStyle(0x663388));
    modeSelectBtn.on('pointerout', () => modeSelectBtn.setFillStyle(0x442266));
    modeSelectBtn.on('pointerdown', () => {
      this.scene.start('ModeSelectScene');
    });

    // Initialize character roster
    CharacterRoster.init();

    // Initialize achievement panel
    AchievementPanel.init();

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

    // Difficulty selector
    const diffLabelY = modeBtnY + 60;
    this.add.text(width / 2, diffLabelY, 'Difficulty', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#888899',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const diffBtnY = diffLabelY + 22;
    const diffBtnWidth = 48;
    const diffBtnHeight = 26;
    const diffGap = 6;
    const totalDiffWidth = 5 * diffBtnWidth + 4 * diffGap;
    const diffStartX = width / 2 - totalDiffWidth / 2;

    this._diffButtons = [];
    this._diffBtnTexts = [];

    const diffOptions = ModeManager.getDifficultyOptions();
    diffOptions.forEach((opt, i) => {
      const x = diffStartX + i * (diffBtnWidth + diffGap) + diffBtnWidth / 2;
      const isActive = opt.key === this._selectedDifficulty;
      const btnColor = isActive ? 0x226644 : 0x334455;

      const btn = this.add.rectangle(x, diffBtnY, diffBtnWidth, diffBtnHeight, btnColor)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(x, diffBtnY, opt.label.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: isActive ? '#44ff88' : '#88aacc',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setFillStyle(isActive ? 0x338855 : 0x445566));
      btn.on('pointerout', () => btn.setFillStyle(isActive ? 0x226644 : 0x334455));
      btn.on('pointerdown', () => this._selectDifficulty(opt.key));

      this._diffButtons.push(btn);
      this._diffBtnTexts.push(txt);
    });

    this._difficultyDescription = this.add.text(width / 2, diffBtnY + 22, ModeManager.getDifficultyDescription(), {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#556677',
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
      this.scene.start('GameScene', { mode: this._selectedMode, difficulty: this._selectedDifficulty });
    });

    // Instructions panel
    const instrY = height * 0.72;

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

    // Equipped character display
    const equippedChar = CharacterRoster.getEquippedCharacter();
    this.add.text(width / 2, instrY + 72, `Playing as: ${equippedChar.name}`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: CHARACTER_DATA.rarityColors[equippedChar.rarity] || '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Character select button
    const charBtnX = width / 2 - 70;
    const charBtnY = height * 0.86;
    const charBtn = this.add.rectangle(charBtnX + 35, charBtnY, 70, 30, 0x224466)
      .setInteractive({ useHandCursor: true });
    const charBtnText = this.add.text(charBtnX + 35, charBtnY, 'CHARS', {
      fontSize: '12px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#4488ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    charBtn.on('pointerover', () => charBtn.setFillStyle(0x336688));
    charBtn.on('pointerout', () => charBtn.setFillStyle(0x224466));
    charBtn.on('pointerdown', () => {
      this.scene.start('CharacterSelectScene');
    });

    // Achievements button
    const achBtnX = width / 2 - 150;
    const achBtnY = height * 0.86;
    const achBtn = this.add.rectangle(achBtnX + 35, achBtnY, 70, 30, 0x224466)
      .setInteractive({ useHandCursor: true });
    const achBtnText = this.add.text(achBtnX + 35, achBtnY, 'ACHIEVE', {
      fontSize: '10px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    achBtn.on('pointerover', () => achBtn.setFillStyle(0x336688));
    achBtn.on('pointerout', () => achBtn.setFillStyle(0x224466));
    achBtn.on('pointerdown', () => {
      AchievementPanel.open();
    });

    // Settings button
    const settingsBtnX = width / 2 + 10;
    const settingsBtnY = height * 0.86;
    const settingsBtn = this.add.rectangle(settingsBtnX + 35, settingsBtnY, 70, 30, 0x224466)
      .setInteractive({ useHandCursor: true });
    const settingsBtnText = this.add.text(settingsBtnX + 35, settingsBtnY, 'SETTINGS', {
      fontSize: '12px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    settingsBtn.on('pointerover', () => settingsBtn.setFillStyle(0x336688));
    settingsBtn.on('pointerout', () => settingsBtn.setFillStyle(0x224466));
    settingsBtn.on('pointerdown', () => {
      this._openSettings();
    });

    // Audio toggle button
    const audioBtnX = width / 2 - 150;
    const audioBtnY = height * 0.92;
    if (typeof AudioManager !== 'undefined') AudioManager.init();
    this._audioEnabled = typeof AudioManager !== 'undefined';
    this._musicOn = this._audioEnabled && !AudioManager.isMusicMuted();
    this._sfxOn = this._audioEnabled && !AudioManager.isSfxMuted();
    this._audioBtn = this.add.rectangle(audioBtnX + 35, audioBtnY, 70, 26, 0x224466)
      .setInteractive({ useHandCursor: true });
    this._audioBtnText = this.add.text(audioBtnX + 35, audioBtnY, 'SFX: ON', {
      fontSize: '10px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this._audioBtn.on('pointerover', () => this._audioBtn.setFillStyle(0x336688));
    this._audioBtn.on('pointerout', () => this._audioBtn.setFillStyle(0x224466));
    this._audioBtn.on('pointerdown', () => this._toggleAudio());

    // Accessibility quick settings
    const accBtnX = width / 2 + 10;
    const accBtnY = height * 0.92;
    this._accBtn = this.add.rectangle(accBtnX + 35, accBtnY, 70, 26, 0x224466)
      .setInteractive({ useHandCursor: true });
    this._accBtnText = this.add.text(accBtnX + 35, accBtnY, 'ACCESS', {
      fontSize: '10px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aa44ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this._accBtn.on('pointerover', () => this._accBtn.setFillStyle(0x336688));
    this._accBtn.on('pointerout', () => this._accBtn.setFillStyle(0x224466));
    this._accBtn.on('pointerdown', () => this._openAccessibility());

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

  _selectDifficulty(difficulty) {
    this._selectedDifficulty = difficulty;
    ModeManager.setDifficulty(difficulty);

    // Update difficulty buttons
    const diffOptions = ModeManager.getDifficultyOptions();
    diffOptions.forEach((opt, i) => {
      const isActive = opt.key === difficulty;
      this._diffButtons[i].setFillStyle(isActive ? 0x226644 : 0x334455);
      this._diffBtnTexts[i].setColor(isActive ? '#44ff88' : '#88aacc');
    });

    // Update description
    this._difficultyDescription.setText(ModeManager.getDifficultyDescription());
  }

  _selectBonusMode() {
    ModeManager.setMode('bonus');
    this._selectedMode = 'bonus';
    this._modeDescription.setText('Time Trial, No Miss, Speed Run, and Zen Mode challenges.');
  }

  _openSettings() {
    if (!this._settingsPanel) {
      this._settingsPanel = new SettingsPanel(this);
    }
    this._settingsPanel.open();
  }

  _toggleAudio() {
    if (!this._audioEnabled || typeof AudioManager === 'undefined') return;
    if (this._sfxOn) {
      AudioManager.mute('sfx');
      this._sfxOn = false;
    } else {
      AudioManager.unmute('sfx');
      this._sfxOn = true;
    }
    this._audioBtnText.setText(`SFX: ${this._sfxOn ? 'ON' : 'OFF'}`);
    this._audioBtnText.setColor(this._sfxOn ? '#44ff88' : '#ff4444');
  }

  _openAccessibility() {
    if (this._accOverlay) { this._accOverlay.destroy(); this._accOverlay = null; }
    if (this._accPanel) { this._accPanel.destroy(); this._accPanel = null; }

    const { width, height } = this.scale;
    this._accOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0).setDepth(500).setInteractive({ useHandCursor: true });

    const panelW = 300;
    const panelH = 280;
    this._accPanel = this.add.container(width / 2, height / 2).setDepth(501);

    this.add.rectangle(0, 0, panelW, panelH, 0x1a1a2e)
      .setOrigin(0.5).setStrokeStyle(2, 0xaa44ff);

    this.add.text(0, -panelH / 2 + 30, 'ACCESSIBILITY', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aa44ff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const startY = -panelH / 2 + 65;
    const spacing = 45;

    // Colorblind mode selector
    this.add.text(-panelW / 2 + 15, startY, 'Colorblind:', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const cbModes = ['none', 'deuteranopia', 'tritanopia', 'achromatopsia'];
    const cbLabels = ['Off', 'Deuteranopia', 'Tritanopia', 'Achromatopsia'];
    const currentCB = typeof Accessibility !== 'undefined' ? Accessibility.getColorblindMode() : 'none';
    this._cbButtons = [];
    const cbBtnW = 65;
    const cbTotalW = cbModes.length * cbBtnW + (cbModes.length - 1) * 4;
    const cbStartX = -cbTotalW / 2;

    cbModes.forEach((mode, i) => {
      const x = cbStartX + i * (cbBtnW + 4) + cbBtnW / 2;
      const isActive = mode === currentCB;
      const btn = this.add.rectangle(x, startY + 22, cbBtnW, 24, isActive ? 0x442266 : 0x333355)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, startY + 22, cbLabels[i], {
        fontSize: '9px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: isActive ? '#aa44ff' : '#888899',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      btn.on('pointerover', () => { if (!isActive) btn.setFillStyle(0x444466); });
      btn.on('pointerout', () => { if (!isActive) btn.setFillStyle(0x333355); });
      btn.on('pointerdown', () => {
        if (typeof Accessibility !== 'undefined') Accessibility.setColorblindMode(mode);
        this._cbButtons.forEach((b, j) => {
          const active = cbModes[j] === mode;
          b.setFillStyle(active ? 0x442266 : 0x333355);
          b.getParentContainer().getChildrenBelow(b).forEach(c => {
            if (c instanceof Phaser.GameObjects.Text) {
              c.setColor(active ? '#aa44ff' : '#888899');
            }
          });
        });
      });
      this._cbButtons.push(btn);
    });

    // Reduced motion toggle
    const rmY = startY + spacing;
    this.add.text(-panelW / 2 + 15, rmY, 'Reduced Motion:', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const rmEnabled = typeof Accessibility !== 'undefined' && Accessibility.getReducedMotion();
    this._rmBtn = this.add.rectangle(panelW / 2 - 30, rmY, 50, 24, rmEnabled ? 0x226644 : 0x442222)
      .setInteractive({ useHandCursor: true });
    this._rmLabel = this.add.text(panelW / 2 - 30, rmY, rmEnabled ? 'ON' : 'OFF', {
      fontSize: '11px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: rmEnabled ? '#44ff88' : '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this._rmBtn.on('pointerdown', () => {
      const newVal = !rmEnabled;
      if (typeof Accessibility !== 'undefined') Accessibility.setReducedMotion(newVal);
      this._rmBtn.setFillStyle(newVal ? 0x226644 : 0x442222);
      this._rmLabel.setText(newVal ? 'ON' : 'OFF');
      this._rmLabel.setColor(newVal ? '#44ff88' : '#ff4444');
    });

    // High contrast toggle
    const hcY = rmY + spacing;
    this.add.text(-panelW / 2 + 15, hcY, 'High Contrast:', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const hcEnabled = typeof Accessibility !== 'undefined' && Accessibility.getHighContrast();
    this._hcBtn = this.add.rectangle(panelW / 2 - 30, hcY, 50, 24, hcEnabled ? 0x226644 : 0x442222)
      .setInteractive({ useHandCursor: true });
    this._hcLabel = this.add.text(panelW / 2 - 30, hcY, hcEnabled ? 'ON' : 'OFF', {
      fontSize: '11px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: hcEnabled ? '#44ff88' : '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this._hcBtn.on('pointerdown', () => {
      const newVal = !hcEnabled;
      if (typeof Accessibility !== 'undefined') Accessibility.setHighContrast(newVal);
      this._hcBtn.setFillStyle(newVal ? 0x226644 : 0x442222);
      this._hcLabel.setText(newVal ? 'ON' : 'OFF');
      this._hcLabel.setColor(newVal ? '#44ff88' : '#ff4444');
    });

    // Close button
    const closeBtn = this.add.rectangle(0, panelH / 2 - 25, 100, 30, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.add.text(0, panelH / 2 - 25, 'CLOSE', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x444466));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x333355));
    closeBtn.on('pointerdown', () => this._closeAccessibility());
    this._accOverlay.on('pointerdown', () => this._closeAccessibility());
  }

  _closeAccessibility() {
    if (this._accOverlay) { this._accOverlay.destroy(); this._accOverlay = null; }
    if (this._accPanel) { this._accPanel.destroy(); this._accPanel = null; }
  }
}
