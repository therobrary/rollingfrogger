// Rolling-Frogger - Settings Panel
// Modal overlay for game settings: sound, difficulty, reset, import/export

class SettingsPanel {
  constructor(scene) {
    this.scene = scene;
    this._overlay = null;
    this._panel = null;
    this._confirmBox = null;
  }

  open() {
    this._overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(500)
      .setInteractive({ useHandCursor: true });

    this._panel = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2)
      .setDepth(501);

    const panelW = Math.min(360, this.scene.scale.width - 40);
    const panelH = 380;

    this.scene.add.rectangle(0, 0, panelW, panelH, 0x1a1a2e)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x44ff88);

    // Title
    this.scene.add.text(0, -panelH / 2 + 30, 'SETTINGS', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    let yPos = -panelH / 2 + 70;
    const spacing = 42;

    // Music toggle
    this._createSettingRow('MUSIC', this._getMusicEnabled(), yPos, (val) => {
      this._setMusicEnabled(val);
      this._musicLabel.setColor(val ? '#44ff88' : '#ff4444');
    });
    this._musicLabel = this.scene.add.text(panelW / 2 - 60, yPos, 'ON', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Sound effects toggle
    yPos += spacing;
    this._createSettingRow('SOUND FX', this._getSfxEnabled(), yPos, (val) => {
      this._setSfxEnabled(val);
      this._sfxLabel.setColor(val ? '#44ff88' : '#ff4444');
    });
    this._sfxLabel = this.scene.add.text(panelW / 2 - 60, yPos, 'ON', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Difficulty selector
    yPos += spacing;
    const diffLabel = this.scene.add.text(-panelW / 2 + 10, yPos, 'DIFFICULTY:', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const difficulty = this._getDifficulty();
    this._diffLabel = this.scene.add.text(panelW / 2 - 40, yPos, difficulty.toUpperCase(), {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const diffBtns = ['easy', 'normal', 'hard'];
    const btnW = 60;
    const totalBtnW = diffBtns.length * btnW + (diffBtns.length - 1) * 5;
    const diffStartX = -totalBtnW / 2;

    this._diffButtons = [];
    diffBtns.forEach((diff, i) => {
      const bx = diffStartX + i * (btnW + 5) + 40;
      const isActive = diff === difficulty;
      const btn = this.scene.add.rectangle(bx + btnW / 2, yPos + 30, btnW, 28, isActive ? 0x226644 : 0x222244)
        .setInteractive({ useHandCursor: true });
      const txt = this.scene.add.text(bx + btnW / 2, yPos + 30, diff.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: isActive ? '#44ff88' : '#888899',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      btn.on('pointerover', () => { if (!isActive) btn.setFillStyle(0x333366); });
      btn.on('pointerout', () => { if (!isActive) btn.setFillStyle(0x222244); });
      btn.on('pointerdown', () => {
        this._setDifficulty(diff);
        this._diffLabel.setText(diff.toUpperCase());
        btn.setFillStyle(0x226644);
        btn.setScale(1.1);
        this.scene.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 150 });
        this._diffButtons.forEach((b, j) => {
          if (b !== btn) {
            b.setFillStyle(0x222244);
          }
        });
      });
      this._diffButtons.push(btn);
    });

    // Reset progress button
    yPos = panelH / 2 - 80;
    const resetBtn = this.scene.add.rectangle(0, yPos, panelW - 40, 36, 0x662222)
      .setInteractive({ useHandCursor: true });
    const resetText = this.scene.add.text(0, yPos, 'RESET PROGRESS', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    resetBtn.on('pointerover', () => resetBtn.setFillStyle(0x883333));
    resetBtn.on('pointerout', () => resetBtn.setFillStyle(0x662222));
    resetBtn.on('pointerdown', () => {
      this._showConfirm('RESET ALL PROGRESS?', 'This cannot be undone!');
    });

    // Export/Import section
    yPos = panelH / 2 - 30;
    const exportBtn = this.scene.add.rectangle(-40, yPos, (panelW - 100) / 2, 28, 0x224466)
      .setInteractive({ useHandCursor: true });
    this.scene.add.text(-40, yPos, 'EXPORT SAVE', {
      fontSize: '11px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#4488ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    exportBtn.on('pointerover', () => exportBtn.setFillStyle(0x336688));
    exportBtn.on('pointerout', () => exportBtn.setFillStyle(0x224466));
    exportBtn.on('pointerdown', () => this._handleExport());

    const importBtn = this.scene.add.rectangle(40, yPos, (panelW - 100) / 2, 28, 0x224466)
      .setInteractive({ useHandCursor: true });
    this.scene.add.text(40, yPos, 'IMPORT SAVE', {
      fontSize: '11px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#4488ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    importBtn.on('pointerover', () => importBtn.setFillStyle(0x336688));
    importBtn.on('pointerout', () => importBtn.setFillStyle(0x224466));
    importBtn.on('pointerdown', () => this._handleImport());

    // Close button
    const closeBtn = this.scene.add.rectangle(0, panelH / 2 - 20, 100, 30, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.scene.add.text(0, panelH / 2 - 20, 'CLOSE', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x444466));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x333355));
    closeBtn.on('pointerdown', () => this.close());
    this._overlay.on('pointerdown', () => this.close());

    // Store references for cleanup
    this._resetBtn = resetBtn;
  }

  close() {
    if (this._overlay) { this._overlay.destroy(); this._overlay = null; }
    if (this._panel) { this._panel.destroy(); this._panel = null; }
    if (this._confirmBox) { this._confirmBox.destroy(); this._confirmBox = null; }
  }

  _createSettingRow(label, enabled, y, callback) {
    const panelW = this.scene.scale.width > 500 ? 360 : this.scene.scale.width - 40;

    this.scene.add.text(-panelW / 2 + 10, y, label + ':', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const toggleW = 50;
    const toggleX = panelW / 2 - 30;
    const bgColor = enabled ? 0x226644 : 0x442222;

    const toggle = this.scene.add.rectangle(toggleX, y, toggleW, 24, bgColor)
      .setInteractive({ useHandCursor: true });
    toggle._enabled = enabled;
    toggle.on('pointerdown', () => {
      toggle._enabled = !toggle._enabled;
      callback(toggle._enabled);
      toggle.setFillStyle(toggle._enabled ? 0x226644 : 0x442222);
    });
    toggle.on('pointerover', () => {
      toggle.setFillStyle(toggle._enabled ? 0x338855 : 0x663333);
    });
    toggle.on('pointerout', () => {
      toggle.setFillStyle(toggle._enabled ? 0x226644 : 0x442222);
    });
  }

  _getMusicEnabled() {
    try { return localStorage.getItem('rollingfrogger_music') !== 'false'; } catch(e) { return true; }
  }

  _setMusicEnabled(val) {
    try { localStorage.setItem('rollingfrogger_music', val ? 'true' : 'false'); } catch(e) {}
  }

  _getSfxEnabled() {
    try { return localStorage.getItem('rollingfrogger_sfx') !== 'false'; } catch(e) { return true; }
  }

  _setSfxEnabled(val) {
    try { localStorage.setItem('rollingfrogger_sfx', val ? 'true' : 'false'); } catch(e) {}
  }

  _getDifficulty() {
    try { return localStorage.getItem('rollingfrogger_difficulty') || 'normal'; } catch(e) { return 'normal'; }
  }

  _setDifficulty(val) {
    try { localStorage.setItem('rollingfrogger_difficulty', val); } catch(e) {}
  }

  _showConfirm(title, message) {
    const panelW = 320;
    const panelH = 140;

    this._confirmBox = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2)
      .setDepth(600);

    this.scene.add.rectangle(0, 0, panelW, panelH, 0x1a1a2e)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xff4444);

    this.scene.add.text(0, -panelH / 2 + 25, title, {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.scene.add.text(0, -panelH / 2 + 55, message, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
      wordWrap: { width: panelW - 40 },
      align: 'center'
    }).setOrigin(0.5);

    const btnW = 100;
    const btnY = panelH / 2 - 25;

    const yesBtn = this.scene.add.rectangle(-btnW / 2 - 5, btnY, btnW, 32, 0x662222)
      .setInteractive({ useHandCursor: true });
    this.scene.add.text(-btnW / 2 - 5, btnY, 'YES', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    yesBtn.on('pointerover', () => yesBtn.setFillStyle(0x883333));
    yesBtn.on('pointerout', () => yesBtn.setFillStyle(0x662222));
    yesBtn.on('pointerdown', () => {
      this._confirmBox.destroy();
      this._confirmBox = null;
      this._doReset();
    });

    const noBtn = this.scene.add.rectangle(btnW / 2 + 5, btnY, btnW, 32, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.scene.add.text(btnW / 2 + 5, btnY, 'NO', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    noBtn.on('pointerover', () => noBtn.setFillStyle(0x444466));
    noBtn.on('pointerout', () => noBtn.setFillStyle(0x333355));
    noBtn.on('pointerdown', () => {
      this._confirmBox.destroy();
      this._confirmBox = null;
    });
  }

  _doReset() {
    CharacterRoster.resetProgress();
    this.close();
    this.scene.scene.start('MenuScene');
  }

  _handleExport() {
    const data = SaveSystem.exportSave();
    if (!data) {
      this._showToast('No save data to export');
      return;
    }

    // Copy to clipboard or show in alert
    try {
      navigator.clipboard.writeText(data).then(() => {
        this._showToast('Save copied to clipboard!');
      }).catch(() => {
        this._showAlert('Copy this save data:', data);
      });
    } catch(e) {
      this._showAlert('Copy this save data:', data);
    }
  }

  _handleImport() {
    const input = prompt('Paste your save data here:');
    if (!input || input.trim() === '') return;

    if (SaveSystem.importSave(input.trim())) {
      this._showToast('Save imported successfully!');
      this.close();
    } else {
      this._showToast('Invalid save data');
    }
  }

  _showToast(msg) {
    const toast = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 + 80, msg, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(700);

    this.scene.time.delayedCall(2000, () => {
      this.scene.tweens.add({
        targets: toast,
        alpha: 0,
        duration: 500,
        onComplete: () => toast.destroy()
      });
    });
  }

  _showAlert(title, data) {
    const panelW = Math.min(400, this.scene.scale.width - 40);
    const panelH = 300;

    const box = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2)
      .setDepth(600);

    this.scene.add.rectangle(0, 0, panelW, panelH, 0x1a1a2e)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x4488ff);

    this.scene.add.text(0, -panelH / 2 + 20, title, {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#4488ff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const textarea = this.scene.add.text(0, -20, data, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#cccccc',
      wordWrap: { width: panelW - 40 },
      align: 'left',
      multilineAlign: 'left'
    }).setOrigin(0.5).setInteractive();

    textarea.on('pointerdown', () => {
      textarea.setSelection();
    });

    const okBtn = this.scene.add.rectangle(0, panelH / 2 - 25, 100, 32, 0x224466)
      .setInteractive({ useHandCursor: true });
    this.scene.add.text(0, panelH / 2 - 25, 'COPY & CLOSE', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#4488ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    okBtn.on('pointerover', () => okBtn.setFillStyle(0x336688));
    okBtn.on('pointerout', () => okBtn.setFillStyle(0x224466));
    okBtn.on('pointerdown', () => {
      try { navigator.clipboard.writeText(data); } catch(e) {}
      box.destroy();
    });
  }
}
