// Rolling-Frogger - Central game tuning configuration
const GameConfig = {
  gameWidth: 640,
  gameWidthHalf: 320,
  moveCooldown: 120,
  moveDuration: 100,
  scorePerHop: 25,
  scoreCrossingBonus: 50, // lanes 4-6
  scoreMedianBonus: 15,
  scoreLevelComplete: 200,
  scorePenalty: 50,
  scoreBayFill: 100,
  initialLives: 3,
  initialLevel: 1,
  deathPauseMs: 800,
  deathTransitionMs: 500,
  levelCompleteFlashMs: 600,
  deathFlashMs: 300,
  cameraShakeDuration: 200,
  cameraShakeStrength: 0.015,
  countdownDuration: 1200,
  magnetDurationMs: 5000,
  pickupCollectionRadius: 28,
  maxPickupsOnScreen: 12,

  // Endless mode configuration
  endlessDistancePerLane: 10,
  endlessDistanceScorePerLane: 10,
  endlessNearMissRadius: 60,
  endlessNearMissBasePoints: 50,
  endlessNearMissComboMultiplier: 0.5,
  endlessNearMissComboTimeout: 3000,
  endlessCheckpointBonus: 200,
  endlessMaxCombo: 10,
  endlessDifficultyScale: 100,
  endlessMaxDifficulty: 3,
  endlessScrollSpeed: 0.05,

  // Bonus mode configuration
  timeTrialDuration: 60,
  speedRunMultiplier: 2,
  speedRunScoreMultiplier: 3,
  zenModeNoDeath: true,
  noMissStrictMode: true,

  // Difficulty Director configuration
  difficultyDirectorEnabled: true,
  difficultyFeedbackDuration: 1500,
  maxDifficultyLevel: 10,
  minDifficultyLevel: 0,
  adaptiveAdjustmentInterval: 15000,
  trackingWindowSize: 60000,
  deathsBeforeDownshift: 3,
  successesBeforeUpshift: 5,

  // Accessibility configuration
  colorblindModes: ['none', 'deuteranopia', 'tritanopia', 'achromatopsia'],
  defaultReducedMotion: false,
  defaultHighContrast: false,

  // Performance configuration
  maxParticles: 100,
  particleBudget: 50,
  audioEnabled: true,
};
