class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
    this.assetBase = 'assets/';
  }

  preload() {
    const { width, height } = this.scale;
    const barWidth = 300;
    const barHeight = 20;

    const barBg = this.add.rectangle(width / 2, height / 2, barWidth + 4, barHeight + 4, 0x333333);
    barBg.setOrigin(0.5);

    // FIX #4: Track progress bar reference to prevent rectangle leak on each progress event
    let progressBar = null;
    this.load.on('progress', (value) => {
      if (progressBar) progressBar.destroy();
      else barBg.destroy();
      progressBar = this.add.rectangle(width / 2, height / 2, barWidth, barHeight, 0x00ff88);
      progressBar.setOrigin(0.5);
      progressBar.scaleX = value;
      progressBar.x = width / 2 - (barWidth * value) / 2;
    });

    this.load.on('complete', () => {
      if (progressBar) progressBar.destroy();
      if (barBg.active) barBg.destroy();
    });

    // Load assets from manifest
    const manifest = AssetManifest.build();
    for (const [key, path] of Object.entries(manifest)) {
      this.load.image(key, path);
    }

    // Fallback procedural textures loaded in parallel
    this.load.on('loaderror', (file) => {
      console.warn(`[BootScene] Asset failed to load: ${file.key} - using fallback`);
    });
  }

  create() {
    // Generate procedural fallback textures in case any PNG failed to load
    this.generateFallbackTextures();
    this.scene.start('MenuScene');
  }

  generateFallbackTextures() {
    // Player fallback
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x44bb44, 1);
      g.fillCircle(14, 14, 10);
      g.fillStyle(0xffffff, 1);
      g.fillRect(10, 10, 3, 3);
      g.fillRect(16, 10, 3, 3);
      g.generateTexture('player', 28, 28);
      g.destroy();
    }

    // Vehicle fallbacks
    for (const vType of VEHICLE_DATA.types) {
      this.makeVehicleFallback(vType.key, vType.color, vType.fallbackWidth, 28);
    }

    // Tile fallbacks
    this.makeTileFallback('tile_road', 0x444444);
    this.makeTileFallback('tile_median', 0x888888);
    this.makeTileFallback('tile_grass', 0x33aa33);
    this.makeTileFallback('tile_sidewalk', 0x999999);
    this.makeTileFallback('tile_school', 0xcc4444);

    // Utility textures
    if (!this.textures.exists('lane_marker')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 12, 16, 8);
      g.generateTexture('lane_marker', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('bg_dark')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(0, 0, 1, 1);
      g.generateTexture('bg_dark', 1, 1);
      g.destroy();
    }

    // Button textures
    this.makeButtonFallback('btn_play', 0x44bb44);
    this.makeButtonFallback('btn_play_hover', 0x66dd66);

    // Star
    if (!this.textures.exists('star')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 0, 2, 2);
      g.fillRect(0, 3, 8, 2);
      g.fillRect(3, 6, 2, 2);
      g.generateTexture('star', 8, 8);
      g.destroy();
    }

    // Pickup textures
    this.makePickupFallback('pickup_coin', 0xffcc00, 'coin');
    this.makePickupFallback('pickup_star', 0xffdd44, 'star');
    this.makePickupFallback('pickup_shield', 0x44aaff, 'shield');
    this.makePickupFallback('pickup_magnet', 0xff4444, 'magnet');
    this.makePickupFallback('pickup_key', 0xcc88ff, 'key');

    // Bike fallback
    this.makeBikeFallback();
  }

  makeVehicleFallback(key, color, w, h) {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x88ccff, 1);
    g.fillRect(w * 0.3, 4, w * 0.2, h * 0.4);
    g.fillRect(w * 0.6, 4, w * 0.2, h * 0.4);
    g.fillStyle(0x222222, 1);
    g.fillRect(4, h - 10, 10, 8);
    g.fillRect(w - 14, h - 10, 10, 8);
    g.generateTexture(key, w + 4, h);
    g.destroy();
  }

  makeTileFallback(key, color) {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.fillRect(0, 0, 64, 64);
    g.generateTexture(key, 64, 64);
    g.destroy();
  }

  makeButtonFallback(key, color) {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.fillRect(0, 0, 160, 48);
    g.lineStyle(2, 0x000000, 0.3);
    g.strokeRect(0, 0, 160, 48);
    g.generateTexture(key, 160, 48);
    g.destroy();
  }

  makePickupFallback(key, color, shape) {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color, 1);
    g.lineStyle(1, 0xffffff, 0.5);

    switch (shape) {
      case 'coin':
        g.fillCircle(10, 10, 8);
        g.strokeCircle(10, 10, 8);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(8, 8, 2);
        break;
      case 'star':
        this.fillStar(g, 10, 10, 5, 9, 4);
        g.strokeCircle(10, 10, 10);
        break;
      case 'shield':
        g.fillCircle(10, 10, 9);
        g.strokeCircle(10, 10, 9);
        g.fillStyle(0xffffff, 0.4);
        g.fillCircle(10, 10, 5);
        g.strokeCircle(10, 10, 5);
        break;
      case 'magnet':
        g.fillRect(4, 2, 12, 16);
        g.strokeRect(4, 2, 12, 16);
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(6, 4, 3, 4);
        g.fillRect(11, 4, 3, 4);
        break;
      case 'key':
        g.fillCircle(8, 8, 5);
        g.strokeCircle(8, 8, 5);
        g.fillRect(8, 8, 8, 3);
        g.fillRect(14, 10, 2, 5);
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(8, 8, 2);
        break;
    }

    g.generateTexture(key, 20, 20);
    g.destroy();
  }

  fillStar(g, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    g.beginPath();
    g.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      g.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      g.lineTo(x, y);
      rot += step;
    }
    g.closePath();
    g.fillPath();
  }

  makeBikeFallback() {
    if (this.textures.exists('bike')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Wheels
    g.lineStyle(2, 0x333333, 1);
    g.strokeCircle(10, 20, 5);
    g.strokeCircle(30, 20, 5);
    // Frame
    g.lineStyle(2, 0x33aa55, 1);
    g.lineBetween(10, 20, 20, 10);
    g.lineBetween(20, 10, 30, 20);
    g.lineBetween(20, 10, 20, 16);
    // Handlebars
    g.lineStyle(2, 0x333333, 1);
    g.lineBetween(18, 10, 22, 10);
    // Seat
    g.fillStyle(0x333333, 1);
    g.fillRect(7, 8, 6, 3);
    g.generateTexture('bike', 40, 28);
    g.destroy();
  }
}
