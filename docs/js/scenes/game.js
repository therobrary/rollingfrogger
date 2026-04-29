class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameActive = false;
    this.hopsCompleted = 0;
    this.playerMoving = false;
    this.moveCooldown = 120;
    this.lastMoveTime = 0;
  }

  init(data) {
    // Explicit state reset on scene creation/replay
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.hopsCompleted = 0;
    this.gameActive = false;
    this.playerMoving = false;
    this.lastMoveTime = 0;
    try {
      this.highScore = parseInt(localStorage.getItem('rollingfrogger_highscore'), 10) || 0;
    } catch(e) {
      this.highScore = 0;
    }
  }

  create() {
    const { width, height } = this.scale;

    this.gameWidth = 640;
    this.gameHeight = 720;
    this.tileSize = 48;
    this.startRowY = this.gameHeight - this.tileSize / 2;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.createVehicleGroups();
    this.drawPlayfield();
    this.createPlayer();
    this.createTraffic();
    this.createHUD();
    this.setupInput();
    this.setupCollisions();

    this.physics.add.overlap(this.player, this.schoolTiles, this.reachGoal, null, this);

    this.updateHUD();
    this.physics.pause();
    this.showCountdown('READY?', () => {
      this.gameActive = true;
      this.physics.resume();
    });
  }

  drawPlayfield() {
    const { tileSize } = this;
    const centerX = this.gameWidth / 2;

    // Lane layout from bottom to top:
    // Start row: safe spawn zone below the first traffic lane
    // Lanes 0-2: 3 road lanes (vehicles go left)
    // Lane 3: median
    // Lanes 4-6: 3 road lanes (vehicles go right)
    // Lane 7: grass
    // Lane 8: sidewalk/bike lane
    // Lane 9: school goal

    const laneY = [];
    for (let i = 0; i < 10; i++) {
      laneY.push(this.gameHeight - (i + 2) * tileSize + tileSize / 2);
    }

    // Bottom safe start row
    for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
      this.add.image(tx * tileSize + tileSize / 2, this.startRowY, 'tile_sidewalk')
        .setAlpha(0.9);
    }

    // Bottom road lanes (0-2) - vehicles travel left
    for (let i = 0; i < 3; i++) {
      for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
        this.add.image(tx * tileSize + tileSize / 2, laneY[i], 'tile_road');
      }
      for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
        this.add.image(tx * tileSize + tileSize / 2, laneY[i], 'lane_marker')
          .setAlpha(0.4);
      }
    }

    // Median (lane 3) - safe zone indicator
    for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
      this.add.image(tx * tileSize + tileSize / 2, laneY[3], 'tile_median');
    }

    // Lane label for median
    this.add.text(12, laneY[3] - 8, 'SAFE ZONE', {
      fontSize: '9px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
      fontStyle: 'bold'
    }).setDepth(1);

    // Top road lanes (4-6) - vehicles travel right
    for (let i = 4; i < 7; i++) {
      for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
        this.add.image(tx * tileSize + tileSize / 2, laneY[i], 'tile_road');
      }
      for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
        this.add.image(tx * tileSize + tileSize / 2, laneY[i], 'lane_marker')
          .setAlpha(0.4);
      }
    }

    // Grass strip (lane 7)
    for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
      this.add.image(tx * tileSize + tileSize / 2, laneY[7], 'tile_grass');
    }

    // Lane label for grass
    this.add.text(12, laneY[7] - 8, 'GRASS', {
      fontSize: '9px',
      fontFamily: 'Arial, sans-serif',
      color: '#66cc66',
      fontStyle: 'bold'
    }).setDepth(1);

    // Sidewalk/bike lane (lane 8)
    for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
      this.add.image(tx * tileSize + tileSize / 2, laneY[8], 'tile_sidewalk');
    }

    // Lane label for sidewalk
    this.add.text(12, laneY[8] - 8, 'BIKE LANE', {
      fontSize: '9px',
      fontFamily: 'Arial, sans-serif',
      color: '#6699cc',
      fontStyle: 'bold'
    }).setDepth(1);

    // School goal (lane 9) - grass on sides, centered school tiles
    for (let tx = 0; tx < Math.ceil(this.gameWidth / tileSize); tx++) {
      this.add.image(tx * tileSize + tileSize / 2, laneY[9], 'tile_grass');
    }
    this.schoolTiles = this.add.group();
    const schoolCenterX = centerX - tileSize * 1.5;
    for (let sx = 0; sx < 3; sx++) {
      const tile = this.add.image(
        schoolCenterX + sx * tileSize + tileSize / 2,
        laneY[9],
        'tile_school'
      );
      tile.setDepth(0);
      this.schoolTiles.add(tile);
    }

    // School label with glow effect
    this.add.text(centerX, laneY[9], 'SCHOOL - WSHS', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffdd44',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Direction arrows for traffic lanes
    this.laneDirections = [
      { lane: 0, dir: -1 }, { lane: 1, dir: -1 }, { lane: 2, dir: -1 },
      { lane: 4, dir: 1 }, { lane: 5, dir: 1 }, { lane: 6, dir: 1 }
    ];
    this.drawTrafficArrows(laneY);

    // Start line indicator
    this.add.rectangle(centerX, this.startRowY + 20, this.gameWidth, 2, 0x44ff88)
      .setAlpha(0.5)
      .setDepth(1);

    this.add.text(centerX, this.startRowY + 12, 'START', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#44ff88',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);
  }

  drawTrafficArrows(laneY) {
    const arrowX = this.gameWidth - 24;
    const arrowColors = ['#ff6666', '#ffaa44', '#ff6666', '#66aaff', '#66dd66', '#66aaff'];

    this.laneDirections.forEach((info, idx) => {
      const arrow = this.add.text(arrowX, laneY[info.lane], info.dir === -1 ? '◄' : '►', {
        fontSize: '14px',
        color: arrowColors[idx] || '#888888',
        align: 'center'
      }).setAlpha(0.3).setDepth(1);
    });
  }

  createPlayer() {
    this.player = this.physics.add.image(
      this.gameWidth / 2,
      this.startRowY,
      'player'
    );
    this.player.setCollideWorldBounds(false);
    this.player.setDepth(10);
    this.player.setVisible(true);
    this.player.setAlpha(1);
  }

  createVehicleGroups() {
    this.cars = this.physics.add.group();
    this.buses = this.physics.add.group();
    this.trucks = this.physics.add.group();
  }

  setupCollisions() {
    this.physics.add.overlap(this.player, this.cars, this.hitByVehicle, null, this);
    this.physics.add.overlap(this.player, this.buses, this.hitByVehicle, null, this);
    this.physics.add.overlap(this.player, this.trucks, this.hitByVehicle, null, this);

    // Vehicle-to-vehicle collisions (only within same lane)
    const sameLane = (a, b) => a.getData('lane') === b.getData('lane');
    this.physics.add.collider(this.cars, this.cars, null, sameLane);
    this.physics.add.collider(this.buses, this.buses, null, sameLane);
    this.physics.add.collider(this.trucks, this.trucks, null, sameLane);
    this.physics.add.collider(this.cars, this.buses, null, sameLane);
    this.physics.add.collider(this.cars, this.trucks, null, sameLane);
    this.physics.add.collider(this.buses, this.trucks, null, sameLane);
  }

  createTraffic() {
    // All available vehicle types with their speed modifiers and physics groups
    const vehicleTypes = [
      { key: 'vehicle_car', group: 'cars', speedMod: 1.0 },
      { key: 'vehicle_car_alt', group: 'cars', speedMod: 1.0 },
      { key: 'vehicle_sedan', group: 'cars', speedMod: 1.0 },
      { key: 'vehicle_sports', group: 'cars', speedMod: 1.1 },
      { key: 'vehicle_hatchback', group: 'cars', speedMod: 1.0 },
      { key: 'vehicle_bus', group: 'buses', speedMod: 0.8 },
      { key: 'vehicle_van', group: 'buses', speedMod: 0.85 },
      { key: 'vehicle_truck', group: 'trucks', speedMod: 0.85 },
      { key: 'vehicle_suv', group: 'trucks', speedMod: 0.9 },
      { key: 'vehicle_pickup', group: 'trucks', speedMod: 0.9 },
    ];

    const speedMultiplier = 1 + (this.level - 1) * 0.06;
    const densityMultiplier = Math.min(1 + (this.level - 1) * 0.10, 1.5);

    this.laneDirections.forEach((laneInfo, idx) => {
      const { lane, dir } = laneInfo;
      const baseSpeed = this.gameWidth / 3;

      // Random number of vehicles per lane (1-4, scaled by density)
      const maxVehicles = Math.floor(2 + 2 * densityMultiplier);
      const vehiclesPerLane = Phaser.Math.Between(1, Math.max(1, maxVehicles));
      
      // Random starting offset for this lane
      const laneOffset = Phaser.Math.Between(0, 100);

      for (let j = 0; j < vehiclesPerLane; j++) {
        // Pick a random vehicle type for each vehicle
        const vType = Phaser.Utils.Array.GetRandom(vehicleTypes);
        const group = this[vType.group];
        const speed = baseSpeed * speedMultiplier * vType.speedMod;

        // Space vehicles with random jitter
        const spacing = this.gameWidth / (vehiclesPerLane + 1);
        const x = spacing * (j + 1) + laneOffset + Phaser.Math.Between(-40, 40);
        const y = this.gameHeight - (lane + 2) * this.tileSize + this.tileSize / 2;

        const vehicle = group.create(x, y, vType.key);
        vehicle.setData('speed', speed * dir);
        vehicle.setData('lane', lane);
        vehicle.setDepth(5);
        if (vehicle.body) vehicle.body.setVelocityX(speed * dir);
      }
    });
  }

  createHUD() {
    // HUD background bar
    this.add.rectangle(this.gameWidth / 2, 16, this.gameWidth, 32, 0x000000)
      .setAlpha(0.6)
      .setDepth(100);

    this.scoreText = this.add.text(12, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(101);

    this.livesText = this.add.text(this.gameWidth - 12, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0).setDepth(101);

    this.levelText = this.add.text(this.gameWidth / 2, 8, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(101);

    this.highScoreText = this.add.text(this.gameWidth / 2, 28, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(101);

    // Location label at bottom
    this.add.text(this.gameWidth / 2, this.gameHeight - 10, 'Rolling Rd x Grigsby Dr', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#444466'
    }).setOrigin(0.5).setDepth(100);
  }

  updateHUD() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText('Lives: ' + '\u2665'.repeat(Math.max(0, this.lives)));
    this.levelText.setText(`Level: ${this.level}  Progress: ${this.hopsCompleted}`);
    this.highScoreText.setText(`Best: ${this.highScore}`);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D'
    });
    // Touch controls for mobile: tap zones
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameActive || this.playerMoving) return;
      const { width, height } = this.scale;
      const cx = width / 2;
      const cy = height / 2;
      let dx = 0, dy = 0;
      const px = pointer.x - cx;
      const py = pointer.y - cy;
      if (Math.abs(px) > Math.abs(py)) {
        dx = px > 0 ? 1 : -1;
      } else {
        dy = py > 0 ? 1 : -1;
      }
      if (dx !== 0 || dy !== 0) {
        this.lastMoveTime = this.time.now;
        this.playerMoving = true;
        const targetX = Phaser.Math.Wrap(
          this.player.x + dx * this.tileSize,
          this.tileSize / 2,
          this.gameWidth - this.tileSize / 2
        );
        const maxY = this.gameHeight - this.tileSize / 2;
        const minY = this.tileSize / 2;
        const targetY = Phaser.Math.Clamp(this.player.y + dy * this.tileSize, minY, maxY);
        this.tweens.add({
          targets: this.player,
          x: targetX,
          y: targetY,
          duration: 100,
          ease: 'Linear',
          onComplete: () => {
            this.playerMoving = false;
            this.player.x = targetX;
            this.player.y = targetY;
            this.onPlayerMoved(dx, dy);
          }
        });
      }
    });
  }

  update(time, delta) {
    // Wrap vehicles around screen edges (physics engine handles movement via velocity)
    const margin = 80;
    const left = -margin;
    const right = this.gameWidth + margin;

    [this.cars, this.buses, this.trucks].forEach(group => {
      group.getChildren().forEach(vehicle => {
        if (!vehicle.active) return;
        const speed = vehicle.getData('speed');
        // Wrap around screen edges (physics engine handles movement via velocity)
        if (speed > 0 && vehicle.x > right) {
          vehicle.x = left;
        } else if (speed < 0 && vehicle.x < left) {
          vehicle.x = right;
        }
      });
    });

    if (!this.gameActive || this.playerMoving) return;

    let dx = 0, dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

    if (dx === 0 && dy === 0) return;
    if (time - this.lastMoveTime < this.moveCooldown) return;

    this.lastMoveTime = time;
    this.playerMoving = true;

    // FIX #2: Replace Phaser.Math.Math2.FloatWrap with Phaser.Math.Wrap (Phaser 3 API)
    const targetX = Phaser.Math.Wrap(
      this.player.x + dx * this.tileSize,
      this.tileSize / 2,
      this.gameWidth - this.tileSize / 2
    );

    const maxY = this.gameHeight - this.tileSize / 2;
    const minY = this.tileSize / 2;
    const targetY = Phaser.Math.Clamp(this.player.y + dy * this.tileSize, minY, maxY);

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 100,
      ease: 'Linear',
      onComplete: () => {
        this.playerMoving = false;
        this.player.x = targetX;
        this.player.y = targetY;
        this.onPlayerMoved(dx, dy);
      }
    });
  }

  onPlayerMoved(dx, dy) {
    const currentLane = this.getPlayerLane();

    if (dy === -1) {
      this.hopsCompleted++;
      this.score += 25;

      if (currentLane >= 9) {
        this.levelComplete();
        return;
      }

      if (currentLane >= 4 && currentLane <= 6) {
        this.score += 50;
      }
    }

    if (dy === 1 && currentLane === 3) {
      this.score += 15;
    }

    this.updateHUD();
  }

  getPlayerLane() {
    const dy = this.startRowY - this.player.y;
    return Math.round(dy / this.tileSize) - 1;
  }

  levelComplete() {
    this.gameActive = false;
    this.physics.pause();
    this.score += 200;

    const flash = this.add.rectangle(
      this.gameWidth / 2,
      this.gameHeight / 2,
      this.gameWidth,
      this.gameHeight,
      0x44ff88,
      0.5
    ).setDepth(200);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        flash.destroy();
        this.hopsCompleted = 0;
        this.level++;
        this.rebuildLevel();
        this.showCountdown(`LEVEL ${this.level}`, () => {
          this.gameActive = true;
          this.physics.resume();
          this.updateHUD();
        });
      }
    });
  }

  rebuildLevel() {
    this.cars.clear(true, true);
    this.buses.clear(true, true);
    this.trucks.clear(true, true);

    this.player.setPosition(this.gameWidth / 2, this.startRowY);
    this.player.setAlpha(1);
    this.player.setVelocity(0, 0);

    this.createTraffic();
  }

  // FIX #1: Reentrancy-protected - set gameActive=false immediately to prevent
  // multiple vehicle overlaps from draining multiple lives from one collision event.
  hitByVehicle() {
    if (this.gameActive === false) return;
    this.gameActive = false;

    this.lives--;
    this.score = Math.max(0, this.score - 50);

    // Death animation: screen flash + camera shake
    this.cameras.main.shake(200, 0.015);
    const flash = this.add.rectangle(
      this.gameWidth / 2,
      this.gameHeight / 2,
      this.gameWidth,
      this.gameHeight,
      0xff0000,
      0.4
    ).setDepth(200);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    this.player.setAlpha(0.3);
    this.physics.pause();

    this.time.delayedCall(800, () => {
      this.player.setPosition(this.gameWidth / 2, this.startRowY);
      this.player.setAlpha(1);
      this.physics.resume();

      if (this.lives <= 0) {
        try {
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('rollingfrogger_highscore', this.highScore);
          }
        } catch(e) {}
        // FIX #3: Pass actual level reached to GameOverScene
        this.time.delayedCall(500, () => {
          this.scene.start('GameOverScene', { won: false, score: this.score, level: this.level });
        });
      } else {
        this.gameActive = true;
        this.updateHUD();
      }
    });
  }

  // FIX #6: Guard overlap so level completion cannot trigger multiple times
  // from the same school tile arrival.
  reachGoal() {
    if (this.gameActive === false) return;
    this.gameActive = false;
    this.levelComplete();
  }

  showCountdown(text, callback) {
    const { width, height } = this.scale;
    const countdownText = this.add.text(width / 2, height / 2, text, {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: countdownText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 400,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(1200, () => {
      countdownText.destroy();
      callback();
    });
  }
}
