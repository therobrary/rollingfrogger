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

    this.score = 0;
    this.lives = GameConfig.initialLives;
    this.level = GameConfig.initialLevel;
    this.hopsCompleted = 0;
    this.gameActive = false;
    this.playerMoving = false;
    this.lastMoveTime = 0;
    ScoreManager.initHighScore(this);
  }

  create() {
    if (this._validationFailed) return;

    const { width, height } = this.scale;

    this.gameWidth = GameConfig.gameWidth;
    this.gameHeight = height;
    this.tileSize = LANE_DATA.TILE_SIZE;
    this.startRowY = this.gameHeight - this.tileSize / 2;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    TrafficSpawner.createVehicleGroups(this);
    const { laneDirections, laneY } = this.laneRenderer.drawPlayfield(this, this.gameWidth, this.tileSize);
    this.laneDirections = laneDirections;
    this.laneRenderer.drawTrafficArrows(this, laneDirections, laneY);
    RiverManager.createRiverGroups(this);
    RiverManager.spawnRiverEntities(this);
    this.createPlayer();
    TrafficSpawner.createTraffic(this, laneDirections);
    this.hudRenderer.create(this, this.gameWidth, this.gameHeight);
    PlayerController.setupInput(this);
    CollisionManager.setupCollisions(this);
    GoalManager.createGoalBays(this);
    CollisionManager.setupGoalOverlap(this);

    this.hudRenderer.update(this.score, this.lives, this.level, this.hopsCompleted, this.highScore);
    this.physics.pause();
    this.showCountdown('READY?', () => {
      this.gameActive = true;
      this.physics.resume();
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

  update(time, delta) {
    TrafficSpawner.updateTraffic(this, time);
    RiverManager.updateRiverEntities(this, delta / 1000);
    RiverManager.movePlayerWithEntity(this, delta / 1000);
    PlayerController.handlePlayerMove(this, time);
  }

  onPlayerMoved(dx, dy) {
    RiverManager.checkDrowning(this);
    if (this.drowning) return;
    ScoreManager.onPlayerMoved(this, dx, dy);
  }

  getPlayerLane() {
    const dy = this.startRowY - this.player.y;
    return Math.round(dy / this.tileSize) - 1;
  }

  levelComplete() {
    ScoreManager.onLevelComplete(this);
  }

  rebuildLevel() {
    this.drowning = false;
    TrafficSpawner.clearTraffic(this);
    RiverManager.clearRiverEntities(this);
    GoalManager.clearGoalBays(this);

    this.player.setPosition(GameConfig.gameWidthHalf, this.startRowY);
    this.player.setAlpha(1);
    this.player.setVelocity(0, 0);

    TrafficSpawner.createTraffic(this, this.laneDirections);
    RiverManager.spawnRiverEntities(this);
    GoalManager.createGoalBays(this);
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
}
