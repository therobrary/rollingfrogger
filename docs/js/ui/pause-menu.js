// Rolling-Frogger - Pause Menu
// Pause overlay UI with resume, restart, and quit options

class PauseMenu {
  constructor() {
    this._overlay = null;
    this._panel = null;
    this._visible = false;
  }

  show(scene) {
    if (this._visible) return;
    this._visible = true;
    this._scene = scene;

    const { width, height } = scene.scale;

    this._overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0)
      .setDepth(500)
      .setInteractive({ useHandCursor: true });

    const panelW = 280;
    const panelH = 240;

    this._panel = scene.add.container(width / 2, height / 2)
      .setDepth(501);

    this._panel.add(scene.add.rectangle(0, 0, panelW, panelH, 0x1a1a2e)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x44ff88));

    this._panel.add(scene.add.text(0, -panelH / 2 + 35, 'PAUSED', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff88',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5));

    const btnY = -panelH / 2 + 80;
    const btnW = 200;
    const btnH = 40;
    const spacing = 50;

    this._createMenuButton(scene, 0, btnY, btnW, btnH, 'RESUME', '#44ff88', () => {
      this.resume(scene);
    });

    this._createMenuButton(scene, 0, btnY + spacing, btnW, btnH, 'RESTART', '#ffaa44', () => {
      this.restart(scene);
    });

    this._createMenuButton(scene, 0, btnY + spacing * 2, btnW, btnH, 'QUIT', '#ff4444', () => {
      this.quit(scene);
    });

    const hintY = panelH / 2 - 30;
    this._panel.add(scene.add.text(0, hintY, 'Press ESC to close', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#666677'
    }).setOrigin(0.5));

    this._overlay.on('pointerdown', () => {
      this.resume(this._scene);
    });
  }

  hide() {
    if (!this._visible) return;
    this._visible = false;
    if (this._overlay) { this._overlay.destroy(); this._overlay = null; }
    if (this._panel) { this._panel.destroy(); this._panel = null; }
  }

  resume(scene) {
    this.hide();
    scene.physics.resume();
    scene.gameActive = true;
  }

  restart(scene) {
    this.hide();
    const mode = scene._mode || 'classic';
    const difficulty = scene._difficulty || ModeManager.getDifficulty();
    const bonusModeId = scene._bonusModeId || null;
    scene.scene.restart({ mode, difficulty, bonusModeId });
  }

  quit(scene) {
    this.hide();
    if (typeof AudioManager !== 'undefined') {
      AudioManager.stopMusic();
    }
    scene.scene.start('MenuScene');
  }

  _createMenuButton(scene, x, y, w, h, text, color, callback) {
    const btn = scene.add.rectangle(x, y, w, h, 0x224466)
      .setInteractive({ useHandCursor: true });
    const btnText = scene.add.text(x, y, text, {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x336688));
    btn.on('pointerout', () => btn.setFillStyle(0x224466));
    btn.on('pointerdown', callback);

    return btn;
  }
}

const PauseMenuInstance = new PauseMenu();
