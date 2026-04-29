class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameActive = false;
    this.hopsCompleted = 0;
    this.playerMoving = false;
    this.lastMoveTime = 0;
    this.ridingEntity = null;
    this.drowning = false;
    this.laneRenderer = new LaneRenderer();
    this.hudRenderer = new HUDRenderer();
    this.currency = 0;
    this.shieldActive = false;
    this.magnetActive = false;
    // Endless mode state
    this._mode = 'classic';
    this.distance = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.nearMisses = [];
    this.endlessSeed = 0;
    this.sectionsGenerated = 0;
    this.currentSectionStart = 0;
    this.currentSectionSize = 0;
    this.nextSection = null;
    this._lastPlayerX = 0;
    this._lastPlayerY = 0;
    this._nearMissEntities = [];
  }

  init(data) {
    const validation = ContentLoader.validate();
    if (!validation.valid) {
      this._validationFailed = true;
      this.showContentError(
        `Content validation failed:\n${validation.errors.join('\n')}`
      );
      return;
    }

    this._mode = (data && data.mode) ? data.mode : ModeManager.getMode();
    this.score = 0;
    this.lives = GameConfig.initialLives;
    this.level = GameConfig.initialLevel;
    this.hopsCompleted = 0;
    this.gameActive = false;
    this.playerMoving = false;
    this.lastMoveTime = 0;
    this.currency = 0;
    this.shieldActive = false;
    this.magnetActive = false;
    this.distance = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.nearMisses = [];
    this.endlessSeed = Math.floor(Math.random() * 999999);
    this.sectionsGenerated = 0;
    this.currentSectionStart = 0;
    this.currentSectionSize = 0;
    this.nextSection = null;
    this._lastPlayerX = 0;
    this._lastPlayerY = 0;
    this._nearMissEntities = [];
    this._equippedCharId = null;
    ScoreManager.initHighScore(this);
  }

  isEndless() {
    return this._mode === 'endless';
  }

  create() {
    if (this._validationFailed) return;

    const { width, height } = this.scale;

    this.gameWidth = GameConfig.gameWidth;
    this.gameHeight = height;
    this.tileSize = LANE_DATA.TILE_SIZE;
    this.startRowY = this.gameHeight - this.tileSize / 2;

    // Load currency from save
    const progress = SaveSystem.load('progress');
    this.currency = progress ? (progress.currency || 0) : 0;

    // Load equipped character
    CharacterRoster.init();
    this._equippedCharId = CharacterRoster.getEquippedId();

    this.cameras.main.setBackgroundColor('#1a1a2e');

    TrafficSpawner.createVehicleGroups(this);

    if (this.isEndless()) {
      this._setupEndlessMode();
    } else {
      this._setupClassicMode();
    }

    this.hudRenderer.create(this, this.gameWidth, this.gameHeight);
    PlayerController.setupInput(this);
    CollisionManager.setupCollisions(this);

    if (!this.isEndless()) {
      GoalManager.createGoalBays(this);
      CollisionManager.setupGoalOverlap(this);
    }

    this.hudRenderer.update(this.score, this.lives, this.level, this.hopsCompleted, this.highScore, this.currency, this.shieldActive, this.magnetActive);
    this.physics.pause();
    this.showCountdown('READY?', () => {
      this.gameActive = true;
      this.physics.resume();
    });
  }

  _setupClassicMode() {
    const { laneDirections, laneY } = this.laneRenderer.drawPlayfield(this, this.gameWidth, this.tileSize);
    this.laneDirections = laneDirections;
    this.laneRenderer.drawTrafficArrows(this, laneDirections, laneY);
    RiverManager.createRiverGroups(this);
    RiverManager.spawnRiverEntities(this);
    this.createPlayer();
    TrafficSpawner.createTraffic(this, laneDirections);
    PickupManager.createPickupGroup(this);
    PickupManager.spawnPickups(this);
  }

  _setupEndlessMode() {
    this.currentSectionSize = LANE_DATA.endlessSectionMinSize;
    this.currentSectionStart = 0;

    // Generate initial section
    const initialSection = ProceduralGenerator.generateSection(this.endlessSeed, 0);
    this.currentSectionSize = initialSection.sectionSize;

    // Draw initial section lanes
    ScrollManager.drawSectionLanes(this, initialSection, 0);

    // Create river physics groups (required before spawning)
    RiverManager.createRiverGroups(this);

    // Spawn initial traffic
    ScrollManager.spawnSectionTraffic(this, initialSection, 0);

    // Spawn initial river entities
    ScrollManager.spawnSectionRiverEntities(this, initialSection, 0);

    this.createPlayer();

    // Create pickup group for endless mode
    PickupManager.createPickupGroup(this);
  }

  createPlayer() {
    const spriteKey = CharacterRoster.getEquippedSpriteKey();
    this.player = this.physics.add.image(
      this.gameWidth / 2,
      this.startRowY,
      spriteKey
    );
    this.player.setCollideWorldBounds(false);
    this.player.setDepth(10);
    this.player.setVisible(true);
    this.player.setAlpha(1);
  }

  update(time, delta) {
    TrafficSpawner.updateTraffic(this, time);
    RiverManager.updateRiverEntities(this, delta / 1000);
    RiverManager.movePlayerWithEntity(this, delta / 1000);
    PlayerController.handlePlayerMove(this, time);
    PickupManager.checkPickupCollection(this);
    PickupManager.updateIndicators(this);
    PickupManager.attractPickupsToPlayer(this);

    // Endless mode: scroll manager and near-miss detection
    if (this.isEndless()) {
      ScrollManager.updateScroll(this, delta);
      this._updateNearMissDetection(time);
      this._updateComboTimer(time, delta);
    }
  }

  onPlayerMoved(dx, dy) {
    RiverManager.checkDrowning(this);
    if (this.drowning) return;

    // Track player position for near-miss detection
    this._lastPlayerX = this.player.x;
    this._lastPlayerY = this.player.y;

    if (this.isEndless()) {
      this._onEndlessMove(dx, dy);
    } else {
      ScoreManager.onPlayerMoved(this, dx, dy);
    }
  }

  _onEndlessMove(dx, dy) {
    // Track distance for endless mode
    if (dy === -1) {
      this.distance += GameConfig.endlessDistancePerLane;
      this.score += GameConfig.endlessDistanceScorePerLane;

      // Check for checkpoint (every section crossed)
      const playerLane = this.getPlayerLane();
      const sectionEnd = this.currentSectionStart + this.currentSectionSize;
      if (playerLane >= sectionEnd - 1) {
        ScrollManager.onCheckpointReached(this);
      }
    }

    ScoreManager.onPlayerMoved(this, dx, dy);
  }

  getPlayerLane() {
    const dy = this.startRowY - this.player.y;
    return Math.round(dy / this.tileSize) - 1;
  }

  levelComplete() {
    ScoreManager.onLevelComplete(this);
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

    this.time.delayedCall(GameConfig.countdownDuration, () => {
      countdownText.destroy();
      callback();
    });
  }

  showContentError(message) {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x111111).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 30, 'CONTENT ERROR', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, message, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: width - 80
    }).setOrigin(0.5);
  }

  _updateNearMissDetection(time) {
    if (!this.player || !this.gameActive) return;

    const radius = GameConfig.endlessNearMissRadius;
    const allVehicles = [];
    [this.cars, this.buses, this.trucks].forEach(group => {
      group.getChildren().forEach(v => {
        if (v.active) allVehicles.push(v);
      });
    });

    for (const vehicle of allVehicles) {
      const dx = this.player.x - vehicle.x;
      const dy = this.player.y - vehicle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check for near miss: vehicle is within near-miss radius but not colliding
      if (dist < radius && dist > 10) {
        const vehicleId = vehicle.key + '_' + Math.floor(vehicle.x) + '_' + Math.floor(vehicle.y);
        const alreadyCounted = this._nearMissEntities.some(e => e.id === vehicleId && (time - e.time) < GameConfig.endlessNearMissComboTimeout);
        if (!alreadyCounted) {
          this._nearMissEntities.push({ id: vehicleId, time: time, dist: dist });
          this._registerNearMiss(time);
        }
      }
    }

    // Clean up old near-miss entries
    this._nearMissEntities = this._nearMissEntities.filter(e => (time - e.time) < GameConfig.endlessNearMissComboTimeout);
  }

  _registerNearMiss(time) {
    this.combo++;
    if (this.combo > GameConfig.endlessMaxCombo) {
      this.combo = GameConfig.endlessMaxCombo;
    }
    this.comboTimer = time + GameConfig.endlessNearMissComboTimeout;

    const multiplier = 1 + (this.combo - 1) * GameConfig.endlessNearMissComboMultiplier;
    const points = Math.floor(GameConfig.endlessNearMissBasePoints * multiplier);
    this.score += points;

    // Show near-miss feedback
    const feedback = this.add.text(
      this.player.x,
      this.player.y - 20,
      this.combo > 1 ? `NEAR MISS x${this.combo}! +${points}` : `NEAR MISS! +${points}`,
      {
        fontSize: '14px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: this.combo > 3 ? '#ff44ff' : '#ffaa44',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: feedback,
      y: feedback.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => feedback.destroy()
    });

    ScoreManager.updateHUD(this);
  }

  _updateComboTimer(time, delta) {
    if (this.combo > 0 && time > this.comboTimer) {
      // Combo expired
      this.combo = 0;
      ScoreManager.updateHUD(this);
    }
  }

  // Override rebuildLevel for endless mode
  rebuildLevel() {
    if (this.isEndless()) {
      // In endless mode, just reset player position
      this.player.setPosition(GameConfig.gameWidthHalf, this.startRowY);
      this.player.setAlpha(1);
      this.player.setVelocity(0, 0);
      this.drowning = false;
      return;
    }
    // Classic-mode rebuild (inlined to avoid super.rebuildLevel crash)
    TrafficSpawner.clearTraffic(this);
    if (typeof RiverManager !== 'undefined') RiverManager.clearRiverEntities(this);
    if (typeof GoalManager !== 'undefined') GoalManager.clearGoalBays(this);
    if (typeof PickupManager !== 'undefined') PickupManager.clearPickups(this);
    this.player.setPosition(GameConfig.gameWidthHalf, this.startRowY);
    this.player.setAlpha(1);
    this.player.setVelocity(0, 0);
    this.drowning = false;
    TrafficSpawner.createTraffic(this, this.laneDirections);
    if (typeof RiverManager !== 'undefined') {
      RiverManager.createRiverGroups(this);
      RiverManager.spawnRiverEntities(this);
    }
    if (typeof GoalManager !== 'undefined') GoalManager.createGoalBays(this);
    if (typeof PickupManager !== 'undefined') PickupManager.spawnPickups(this);
  }
}
