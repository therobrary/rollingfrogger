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
    // Bonus mode state
    this._bonusModeId = null;
    this._bonusSpeedMultiplier = 1;
    this._bonusScoreMultiplier = 1;
    this._bonusNoDeath = false;
    this._bonusStrictNearMisses = false;
    this._timeTrialRemaining = 0;
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
    this._livesAtStart = GameConfig.initialLives;
    this._currencyAtStart = 0;
    this._perfectMode = true;
    // Bonus mode state
    this._bonusModeId = data && data.bonusModeId ? data.bonusModeId : null;
    this._bonusSpeedMultiplier = 1;
    this._bonusScoreMultiplier = 1;
    this._bonusNoDeath = false;
    this._bonusStrictNearMisses = false;
    this._timeTrialRemaining = 0;

    ScoreManager.initHighScore(this);
    AchievementManager.init();
    ChallengeManager.init();
  }

  isEndless() {
    return this._mode === 'endless';
  }

  isBonus() {
    return this._mode === 'bonus';
  }

  getBonusModeId() {
    return this._bonusModeId;
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
    AchievementManager.trackCharacterPlayed(this._equippedCharId);

    this.cameras.main.setBackgroundColor('#1a1a2e');

    TrafficSpawner.createVehicleGroups(this);

    if (this.isEndless()) {
      this._setupEndlessMode();
    } else if (this.isBonus()) {
      this._setupBonusMode();
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

    // Apply bonus mode settings
    if (this.isBonus() && this._bonusModeId) {
      const bonusConfig = BonusManager.startBonusMode(this._bonusModeId);
      if (bonusConfig) {
        this._bonusSpeedMultiplier = bonusConfig.speedMultiplier;
        this._bonusScoreMultiplier = bonusConfig.scoreMultiplier;
        this._bonusNoDeath = bonusConfig.noDeath;
        this._bonusStrictNearMisses = bonusConfig.strictNearMisses;
        if (bonusConfig.timeTrialDuration > 0) {
          this._timeTrialRemaining = bonusConfig.timeTrialDuration;
        }
      }
    }

    this.hudRenderer.update(this.score, this.lives, this.level, this.hopsCompleted, this.highScore, this.currency, this.shieldActive, this.magnetActive);
    this.physics.pause();
    this.showCountdown('READY?', () => {
      this.gameActive = true;
      this.physics.resume();
    });
    this._lastEndlessTimeCheck = this.time.now;
    this._lastBonusTimeCheck = this.time.now;
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

  _setupBonusMode() {
    // Bonus mode uses classic-style level completion but with modifiers
    const { laneDirections, laneY } = this.laneRenderer.drawPlayfield(this, this.gameWidth, this.tileSize);
    this.laneDirections = laneDirections;
    this.laneRenderer.drawTrafficArrows(this, laneDirections, laneY);
    RiverManager.createRiverGroups(this);
    RiverManager.spawnRiverEntities(this);
    this.createPlayer();

    // Apply speed multiplier to traffic
    TrafficSpawner.createTraffic(this, laneDirections, this._bonusSpeedMultiplier);
    PickupManager.createPickupGroup(this);
    PickupManager.spawnPickups(this);

    // Zen mode: no death, infinite lives
    if (this._bonusNoDeath) {
      this.lives = 999;
    }
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
      this._trackEndlessTime(time, delta);
    }

    // Bonus mode: timer and special rules
    if (this.isBonus() && this.gameActive) {
      this._updateBonusMode(time, delta);
      if (this._bonusStrictNearMisses) {
        this._updateNearMissDetection(time);
      }
    }
  }

  onPlayerMoved(dx, dy) {
    RiverManager.checkDrowning(this);
    if (this.drowning) return;

    // Track player position for near-miss detection
    this._lastPlayerX = this.player.x;
    this._lastPlayerY = this.player.y;

    if (dy === -1) {
      AchievementManager.trackHop();
      ChallengeManager.checkChallengeProgress('hops', 1);
    }

    if (this.isEndless()) {
      this._onEndlessMove(dx, dy);
    } else if (this.isBonus()) {
      this._onBonusMove(dx, dy);
    } else {
      ScoreManager.onPlayerMoved(this, dx, dy);
    }
  }

  _onEndlessMove(dx, dy) {
    // Track distance for endless mode
    if (dy === -1) {
      const deltaDistance = GameConfig.endlessDistancePerLane;
      this.distance += deltaDistance;
      this.score += GameConfig.endlessDistanceScorePerLane;

      ChallengeManager.checkChallengeProgress('distance', deltaDistance);

      // Check for checkpoint (every section crossed)
      const playerLane = this.getPlayerLane();
      const sectionEnd = this.currentSectionStart + this.currentSectionSize;
      if (playerLane >= sectionEnd - 1) {
        ScrollManager.onCheckpointReached(this);
      }
    }

    ScoreManager.onPlayerMoved(this, dx, dy);
  }

  _onBonusMove(dx, dy) {
    // Apply bonus score multiplier
    if (dy === -1) {
      const basePoints = GameConfig.scorePerHop;
      const multipliedPoints = Math.floor(basePoints * this._bonusScoreMultiplier);
      this.score += multipliedPoints;
    }

    ScoreManager.onPlayerMoved(this, dx, dy);
  }

  getPlayerLane() {
    const dy = this.startRowY - this.player.y;
    return Math.round(dy / this.tileSize) - 1;
  }

  levelComplete() {
    ScoreManager.onLevelComplete(this);
    if (this._perfectMode && this.lives === this._livesAtStart) {
      AchievementManager.trackPerfectLevel();
    }
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

  _updateComboTimer(time, delta) {
    if (this.combo > 0 && time > this.comboTimer) {
      // Combo expired
      this.combo = 0;
      ScoreManager.updateHUD(this);
    }
  }

  _trackEndlessTime(time, delta) {
    if (!this.gameActive) return;
    const elapsed = (time - this._lastEndlessTimeCheck) / 1000;
    if (elapsed >= 1) {
      AchievementManager.trackEndlessTime(Math.floor(elapsed));
      ChallengeManager.checkChallengeProgress('endlessTime', Math.floor(elapsed));
      this._lastEndlessTimeCheck = time;
    }
  }

  _updateBonusMode(time, delta) {
    // Time Trial: countdown timer
    if (this._bonusModeId === 'time_trial' && this._timeTrialRemaining > 0) {
      const elapsed = (time - (this._lastBonusTimeCheck || time)) / 1000;
      if (elapsed >= 1) {
        this._timeTrialRemaining = Math.max(0, this._timeTrialRemaining - Math.floor(elapsed));
        this._lastBonusTimeCheck = time;

        if (this._timeTrialRemaining <= 0) {
          this._onTimeTrialExpired();
        }
      }
    }
  }

  _onTimeTrialExpired() {
    // Time Trial ended - check if player completed enough levels
    const stats = `Level ${this.level} | Score: ${this.score}`;
    ModeManager.saveHighScore('bonus', this.score, stats);

    // Award bonus high score
    if (this._bonusModeId) {
      BonusManager.saveBonusHighScore(this._bonusModeId, this.score, stats);
    }

    this.gameActive = false;
    this.physics.pause();

    const { width, height } = this.scale;
    const resultText = this.level >= 3 ? 'TIME UP - GOOD RUN!' : 'TIME UP - TRY AGAIN!';
    const resultColor = this.level >= 3 ? '#44ff88' : '#ffaa44';

    this.add.text(width / 2, height / 2 - 20, resultText, {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(200);

    ScoreManager.onGameOver(this);
    this.time.delayedCall(2000, () => {
      this.scene.start('GameOverScene', { won: false, score: this.score, level: this.level, bonusMode: this._bonusModeId });
    });
  }

  _registerNearMiss(time) {
    this.combo++;
    if (this.combo > GameConfig.endlessMaxCombo) {
      this.combo = GameConfig.endlessMaxCombo;
    }
    this.comboTimer = time + GameConfig.endlessNearMissComboTimeout;

    AchievementManager.trackNearMissCombo(this.combo);
    ChallengeManager.checkChallengeProgress('nearMisses', 1);

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

    // Bonus mode: track no-miss failure
    if (this.isBonus() && this._bonusStrictNearMisses && this._nearMissEntities.length > 0) {
      const stats = `Near misses: ${this._nearMissEntities.length} | Score: ${this.score}`;
      BonusManager.saveBonusHighScore(this._bonusModeId, this.score, stats);
      this.time.delayedCall(1000, () => {
        this.scene.start('GameOverScene', { won: false, score: this.score, level: this.level, bonusMode: this._bonusModeId, noMissFail: true });
      });
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
    TrafficSpawner.createTraffic(this, this.laneDirections, this._bonusSpeedMultiplier);
    if (typeof RiverManager !== 'undefined') {
      RiverManager.createRiverGroups(this);
      RiverManager.spawnRiverEntities(this);
    }
    if (typeof GoalManager !== 'undefined') GoalManager.createGoalBays(this);
    if (typeof PickupManager !== 'undefined') PickupManager.spawnPickups(this);

    // Reset near miss tracking for no-miss mode
    if (this.isBonus() && this._bonusStrictNearMisses) {
      this._nearMissEntities = [];
    }
  }
}
