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
      barBg.destroy();
      progressBar = this.add.rectangle(width / 2, height / 2, barWidth, barHeight, 0x00ff88);
      progressBar.setOrigin(0.5);
      progressBar.scaleX = value;
      progressBar.x = width / 2 - (barWidth * value) / 2;
    });

    this.load.on('complete', () => {
      if (progressBar) progressBar.destroy();
      barBg.destroy();
    });

    // Load PNG assets from docs/assets/ with fallbacks
    this.load.image('player', `${this.assetBase}player_student.png`);
    this.load.image('vehicle_car', `${this.assetBase}vehicle_car_red.png`);
    this.load.image('vehicle_car_alt', `${this.assetBase}vehicle_car_green.png`);
    this.load.image('vehicle_bus', `${this.assetBase}vehicle_bus_yellow.png`);
    this.load.image('vehicle_truck', `${this.assetBase}vehicle_truck_blue.png`);
    this.load.image('vehicle_sedan', `${this.assetBase}vehicle_sedan_purple.png`);
    this.load.image('vehicle_van', `${this.assetBase}vehicle_van_orange.png`);
    this.load.image('vehicle_suv', `${this.assetBase}vehicle_suv_white.png`);
    this.load.image('vehicle_pickup', `${this.assetBase}vehicle_pickup_red.png`);
    this.load.image('vehicle_sports', `${this.assetBase}vehicle_sports_yellow.png`);
    this.load.image('vehicle_hatchback', `${this.assetBase}vehicle_hatchback_teal.png`);
    this.load.image('tile_road', `${this.assetBase}tile_road.png`);
    this.load.image('tile_median', `${this.assetBase}tile_median.png`);
    this.load.image('tile_grass', `${this.assetBase}tile_grass.png`);
    this.load.image('tile_sidewalk', `${this.assetBase}tile_sidewalk.png`);
    this.load.image('tile_school', `${this.assetBase}tile_school_goal.png`);
    this.load.image('lane_marker', `${this.assetBase}lane_marker.png`);
    this.load.image('obstacle_cone', `${this.assetBase}obstacle_cone.png`);
    this.load.image('bg_dark', `${this.assetBase}tile_bg_dark.png`);

    // Fallback procedural textures loaded in parallel
    this.load.on('fileprogress', (file) => {
      if (file.status === 4) {
        console.warn(`[BootScene] Asset failed to load: ${file.key} - using fallback`);
      }
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
    this.makeVehicleFallback('vehicle_car', 0xdd3333, 48, 28);
    this.makeVehicleFallback('vehicle_car_alt', 0x33aa55, 48, 28);
    this.makeVehicleFallback('vehicle_bus', 0xddaa00, 64, 28);
    this.makeVehicleFallback('vehicle_truck', 0x3366cc, 56, 28);
    this.makeVehicleFallback('vehicle_sedan', 0x7b2d8b, 48, 28);
    this.makeVehicleFallback('vehicle_van', 0xdd8800, 64, 28);
    this.makeVehicleFallback('vehicle_suv', 0xcccccc, 56, 28);
    this.makeVehicleFallback('vehicle_pickup', 0xcc2222, 56, 28);
    this.makeVehicleFallback('vehicle_sports', 0xffcc00, 44, 28);
    this.makeVehicleFallback('vehicle_hatchback', 0x22aaaa, 44, 28);

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
}
