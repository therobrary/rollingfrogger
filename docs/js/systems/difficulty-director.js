// Rolling-Frogger - Difficulty Director System
// Adaptive difficulty that adjusts based on player performance
// Tracks deaths, successes, and performance to tune speed/density multipliers

const DifficultyDirector = {
  // Current state
  _mode: 'normal',
  _difficultyLevel: 0,
  _deathCount: 0,
  _successCount: 0,
  _lastAdjustmentTime: 0,
  _trackingWindow: { deaths: 0, successes: 0, startTime: 0 },
  _performanceHistory: [],

  // Initialize the difficulty director for a given mode
  init(mode) {
    this._mode = mode || BalanceData.defaultMode;
    this._difficultyLevel = 0;
    this._deathCount = 0;
    this._successCount = 0;
    this._lastAdjustmentTime = 0;
    this._trackingWindow = { deaths: 0, successes: 0, startTime: Date.now() };
    this._performanceHistory = [];

    const config = BalanceData.getModeConfig(this._mode);
    if (config && config.speedMultiplier) {
      // Store base multipliers for the mode
      this._baseSpeedMultiplier = config.speedMultiplier;
      this._baseDensityMultiplier = config.densityMultiplier || 1.0;
      this._baseHazardVariety = config.hazardVariety || 1.0;
      this._basePickupSpawnRate = config.pickupSpawnRate || 1.0;
      this._baseSafeZoneFrequency = config.safeZoneFrequency || 1.0;
      this._baseScoreMultiplier = config.scoreMultiplier || 1.0;
    } else {
      this._baseSpeedMultiplier = 1.0;
      this._baseDensityMultiplier = 1.0;
      this._baseHazardVariety = 1.0;
      this._basePickupSpawnRate = 1.0;
      this._baseSafeZoneFrequency = 1.0;
      this._baseScoreMultiplier = 1.0;
    }

    return this;
  },

  // Called each frame/level to adjust difficulty based on performance
  update(scene, time) {
    if (!scene.gameActive) return;

    const now = time || Date.now();
    const adaptive = BalanceData.adaptive;

    // Check if enough time has passed since last adjustment
    if (now - this._lastAdjustmentTime < adaptive.minAdjustmentInterval * 1000) {
      return;
    }

    // Check tracking window expiry
    const windowElapsed = now - this._trackingWindow.startTime;
    if (windowElapsed > adaptive.trackingWindowSize) {
      // Decay the tracking window
      const decayFactor = 0.5;
      this._trackingWindow.deaths = Math.floor(this._trackingWindow.deaths * decayFactor);
      this._trackingWindow.successes = Math.floor(this._trackingWindow.successes * decayFactor);
      this._trackingWindow.startTime = now;
    }

    // Evaluate whether to adjust difficulty
    if (this._mode === 'hardcore') return;
    if (this._trackingWindow.deaths >= adaptive.deathsBeforeDownshift) {
      this._adjustDifficulty(-1, scene);
      this._trackingWindow.deaths = 0;
    } else if (this._mode !== 'zen' && this._trackingWindow.successes >= adaptive.successesBeforeUpshift) {
      this._adjustDifficulty(1, scene);
      this._trackingWindow.successes = 0;
    }
  },

  // Get current speed multiplier (base * adaptive adjustments)
  getSpeedMultiplier() {
    const levelStep = BalanceData.adaptive.levelStepSize;
    const clampedLevel = Math.max(BalanceData.adaptive.minDifficultyLevel,
      Math.min(BalanceData.adaptive.maxDifficultyLevel, this._difficultyLevel));
    return this._baseSpeedMultiplier * (1 + clampedLevel * levelStep);
  },

  // Get current density multiplier
  getDensityMultiplier() {
    const levelStep = BalanceData.adaptive.levelStepSize;
    const clampedLevel = Math.max(BalanceData.adaptive.minDifficultyLevel,
      Math.min(BalanceData.adaptive.maxDifficultyLevel, this._difficultyLevel));
    return this._baseDensityMultiplier * (1 + clampedLevel * levelStep * 0.7);
  },

  // Get hazard variety (which hazard types should appear)
  getHazardVariety() {
    const levelStep = BalanceData.adaptive.levelStepSize;
    const clampedLevel = Math.max(BalanceData.adaptive.minDifficultyLevel,
      Math.min(BalanceData.adaptive.maxDifficultyLevel, this._difficultyLevel));
    const baseVariety = this._baseHazardVariety;
    const adaptiveBoost = clampedLevel * levelStep;
    return Math.min(baseVariety + adaptiveBoost, 3.0);
  },

  // Get pickup spawn rate
  getPickupSpawnRate() {
    const levelStep = BalanceData.adaptive.levelStepSize;
    const clampedLevel = Math.max(BalanceData.adaptive.minDifficultyLevel,
      Math.min(BalanceData.adaptive.maxDifficultyLevel, this._difficultyLevel));
    return this._basePickupSpawnRate * (1 - clampedLevel * levelStep * 0.3);
  },

  // Get safe zone frequency
  getSafeZoneFrequency() {
    const levelStep = BalanceData.adaptive.levelStepSize;
    const clampedLevel = Math.max(BalanceData.adaptive.minDifficultyLevel,
      Math.min(BalanceData.adaptive.maxDifficultyLevel, this._difficultyLevel));
    return this._baseSafeZoneFrequency * (1 - clampedLevel * levelStep * 0.4);
  },

  // Get current score multiplier
  getScoreMultiplier() {
    const levelStep = BalanceData.adaptive.levelStepSize;
    const clampedLevel = Math.max(BalanceData.adaptive.minDifficultyLevel,
      Math.min(BalanceData.adaptive.maxDifficultyLevel, this._difficultyLevel));
    return this._baseScoreMultiplier * (1 + clampedLevel * levelStep * 0.5);
  },

  // Track player death for adaptive difficulty
  trackDeath(scene) {
    this._deathCount++;
    this._trackingWindow.deaths++;
    this._trackingWindow.successes = 0; // Reset success streak

    const performanceRecord = {
      type: 'death',
      time: Date.now(),
      difficultyLevel: this._difficultyLevel,
      deathCount: this._deathCount
    };
    this._performanceHistory.push(performanceRecord);

    // Keep history manageable
    if (this._performanceHistory.length > 50) {
      this._performanceHistory = this._performanceHistory.slice(-30);
    }

    // Immediate downshift for hardcore mode
    if (this._mode === 'hardcore') {
      // Hardcore: don't adjust, just track
    } else {
      // Check if we should immediately adjust
      if (this._deathCount >= BalanceData.adaptive.deathsBeforeDownshift) {
        this._adjustDifficulty(-1, scene);
      }
    }
  },

  // Track player success (level complete, checkpoint reached)
  trackSuccess(scene) {
    this._successCount++;
    this._trackingWindow.successes++;
    this._trackingWindow.deaths = Math.max(0, this._trackingWindow.deaths - 1);

    const performanceRecord = {
      type: 'success',
      time: Date.now(),
      difficultyLevel: this._difficultyLevel,
      score: scene.score || 0
    };
    this._performanceHistory.push(performanceRecord);

    if (this._performanceHistory.length > 50) {
      this._performanceHistory = this._performanceHistory.slice(-30);
    }

    if (this._mode !== 'zen') {
      if (this._trackingWindow.successes >= BalanceData.adaptive.successesBeforeUpshift) {
        this._adjustDifficulty(1, scene);
      }
    }
  },

  // Track overall performance metrics
  trackPerformance(scene) {
    const now = Date.now();
    const avgScore = this._performanceHistory
      .filter(p => p.type === 'success')
      .reduce((sum, p) => sum + (p.score || 0), 0) / Math.max(1, this._performanceHistory.filter(p => p.type === 'success').length);

    const deathRate = this._performanceHistory.filter(p => p.type === 'death').length / Math.max(1, this._performanceHistory.length);

    return {
      totalDeaths: this._deathCount,
      totalSuccesses: this._successCount,
      currentDifficultyLevel: this._difficultyLevel,
      avgScore: avgScore,
      deathRate: deathRate,
      performanceHistory: this._performanceHistory
    };
  },

  // Adjust difficulty level up or down
  _adjustDifficulty(direction, scene) {
    const adaptive = BalanceData.adaptive;
    const sensitivity = BalanceData.getModeConfig(this._mode).adaptiveSensitivity || 0.5;
    const step = Math.max(1, Math.floor(sensitivity));

    this._difficultyLevel = Math.max(adaptive.minDifficultyLevel,
      Math.min(adaptive.maxDifficultyLevel,
        this._difficultyLevel + (direction * step)));

    this._lastAdjustmentTime = Date.now();

    if (scene && scene.hudRenderer) {
      // Show difficulty adjustment feedback
      const feedbackText = direction > 0 ? 'DIFFICULTY UP!' : 'DIFFICULTY DOWN!';
      const feedbackColor = direction > 0 ? '#ffaa44' : '#44ff88';
      const text = scene.add.text(scene.gameWidth / 2, scene.gameHeight / 2 + 60, feedbackText, {
        fontSize: '16px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: feedbackColor,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(200);

      scene.tweens.add({
        targets: text,
        alpha: 0,
        y: text.y - 30,
        duration: 1500,
        onComplete: () => text.destroy()
      });
    }
  },

  // Get mode info
  getMode() {
    return this._mode;
  },

  getDifficultyLevel() {
    return this._difficultyLevel;
  },

  // Get difficulty label
  getDifficultyLabel() {
    const level = this._difficultyLevel;
    if (level < 2) return 'Fair';
    if (level < 5) return 'Moderate';
    if (level < 8) return 'Challenging';
    return 'Intense';
  },

  // Reset all state (call between levels or modes)
  reset() {
    this._difficultyLevel = 0;
    this._deathCount = 0;
    this._successCount = 0;
    this._lastAdjustmentTime = 0;
    this._trackingWindow = { deaths: 0, successes: 0, startTime: Date.now() };
    this._performanceHistory = [];
  }
};
