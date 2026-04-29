// Rolling-Frogger - Balance Data / Tuning Parameters
// Defines difficulty curves, adaptive parameters, and mode-specific tuning

const BalanceData = {
  // Difficulty modes and their base multipliers
  difficultyModes: {
    easy: {
      label: 'Easy',
      speedMultiplier: 0.75,
      densityMultiplier: 0.7,
      hazardVariety: 0.5,
      pickupSpawnRate: 0.8,
      safeZoneFrequency: 1.5,
      adaptiveSensitivity: 0.3,
      scoreMultiplier: 0.8,
      description: 'Slower traffic, fewer hazards. Great for beginners.'
    },
    normal: {
      label: 'Normal',
      speedMultiplier: 1.0,
      densityMultiplier: 1.0,
      hazardVariety: 1.0,
      pickupSpawnRate: 1.0,
      safeZoneFrequency: 1.0,
      adaptiveSensitivity: 0.5,
      scoreMultiplier: 1.0,
      description: 'Balanced difficulty. The standard Rolling-Frogger experience.'
    },
    hard: {
      label: 'Hard',
      speedMultiplier: 1.3,
      densityMultiplier: 1.3,
      hazardVariety: 1.5,
      pickupSpawnRate: 0.6,
      safeZoneFrequency: 0.7,
      adaptiveSensitivity: 0.7,
      scoreMultiplier: 1.5,
      description: 'Fast traffic, dense hazards. For experienced players.'
    }
  },

  // Adaptive difficulty parameters
  adaptive: {
    // How many deaths trigger a difficulty decrease
    deathsBeforeDownshift: 3,
    // How many successes trigger a difficulty increase
    successesBeforeUpshift: 5,
    // Minimum difficulty level (0 = easiest curve)
    minDifficultyLevel: 0,
    // Maximum difficulty level (10 = hardest)
    maxDifficultyLevel: 10,
    // How much each level changes multipliers
    levelStepSize: 0.05,
    // Decay time (ms) for death/success tracking window
    trackingWindowSize: 60000,
    // Minimum time between difficulty adjustments
    minAdjustmentInterval: 15000
  },

  // Zen mode parameters
  zenMode: {
    label: 'Zen',
    speedMultiplier: 0.6,
    densityMultiplier: 0.5,
    hazardVariety: 0.3,
    pickupSpawnRate: 1.5,
    safeZoneFrequency: 2.0,
    scoreMultiplier: 0.5,
    noDeath: true,
    description: 'Relaxed mode. No death, slow traffic, plenty of pickups.'
  },

  // Hardcore mode parameters
  hardcoreMode: {
    label: 'Hardcore',
    speedMultiplier: 1.5,
    densityMultiplier: 1.5,
    hazardVariety: 2.0,
    pickupSpawnRate: 0.3,
    safeZoneFrequency: 0.5,
    scoreMultiplier: 2.0,
    oneHitDeath: true,
    description: 'Extreme mode. One hit and you are out. Double score for the run.'
  },

  // Default difficulty mode key
  defaultMode: 'normal',

  // All valid difficulty mode keys
  validModeKeys: ['easy', 'normal', 'hard', 'zen', 'hardcore'],

  // Hazard type definitions and which difficulty levels they appear
  hazardTypes: [
    { id: 'car', name: 'Car', minDifficulty: 0, speedRange: [0.8, 1.2] },
    { id: 'bus', name: 'Bus', minDifficulty: 2, speedRange: [0.5, 0.8] },
    { id: 'truck', name: 'Truck', minDifficulty: 4, speedRange: [0.6, 1.0] },
    { id: 'speeder', name: 'Speeder', minDifficulty: 6, speedRange: [1.5, 2.0] },
    { id: 'tank', name: 'Tank', minDifficulty: 8, speedRange: [0.3, 0.5] }
  ],

  // Pickup spawn rates by difficulty level
  pickupSpawnRates: {
    coin: { baseRate: 0.4, maxPerScreen: 6 },
    shield: { baseRate: 0.05, maxPerScreen: 1 },
    magnet: { baseRate: 0.05, maxPerScreen: 1 }
  },

  // Safe zone frequency (how often safe lanes appear in endless mode)
  safeZoneFrequency: {
    min: 0.2,
    max: 0.6,
    baseFrequency: 0.4
  },

  // Get difficulty mode config by key
  getModeConfig(key) {
    if (key === 'zen') return this.zenMode;
    if (key === 'hardcore') return this.hardcoreMode;
    return this.difficultyModes[key] || this.difficultyModes.normal;
  },

  // Get available hazard types for a given difficulty level
  getHazardTypes(difficultyLevel) {
    return this.hazardTypes.filter(h => h.minDifficulty <= difficultyLevel);
  },

  // Calculate effective multiplier for a mode at a given difficulty level
  getEffectiveMultiplier(baseMultiplier, difficultyLevel) {
    const step = this.adaptive.levelStepSize;
    const clampedLevel = Math.max(this.adaptive.minDifficultyLevel,
      Math.min(this.adaptive.maxDifficultyLevel, difficultyLevel));
    return baseMultiplier * (1 + clampedLevel * step);
  },

  // Validate a difficulty mode key
  isValidMode(key) {
    return this.validModeKeys.includes(key);
  }
};
