// Rolling-Frogger - Achievement Data Definitions
// Defines all achievements and daily challenges

const ACHIEVEMENT_DATA = {
  achievements: [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Move 1 tile forward',
      condition: 'hops',
      target: 1,
      reward: 5,
    },
    {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Die once',
      condition: 'deaths',
      target: 1,
      reward: 10,
    },
    {
      id: 'speed_runner',
      name: 'Speed Runner',
      description: 'Complete 10 levels',
      condition: 'levelsCompleted',
      target: 10,
      reward: 100,
    },
    {
      id: 'survivor',
      name: 'Survivor',
      description: 'Survive 5 minutes in endless mode',
      condition: 'endlessTime',
      target: 300,
      reward: 50,
    },
    {
      id: 'collector',
      name: 'Collector',
      description: 'Collect 100 coins',
      condition: 'coinsCollected',
      target: 100,
      reward: 75,
    },
    {
      id: 'lucky',
      name: 'Lucky',
      description: 'Get 5 near misses in a row',
      condition: 'maxNearMissCombo',
      target: 5,
      reward: 60,
    },
    {
      id: 'frogger',
      name: 'Frogger',
      description: 'Complete a level without taking damage',
      condition: 'perfectLevel',
      target: 1,
      reward: 40,
    },
    {
      id: 'marathon',
      name: 'Marathon',
      description: 'Survive 10 minutes in endless mode',
      condition: 'endlessTime',
      target: 600,
      reward: 150,
    },
    {
      id: 'rich',
      name: 'Rich',
      description: 'Accumulate 1000 currency',
      condition: 'totalCurrency',
      target: 1000,
      reward: 200,
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Play as every character',
      condition: 'charactersPlayed',
      target: 8,
      reward: 250,
    },
  ],

  getAchievementDef(id) {
    return this.achievements.find(a => a.id === id) || null;
  },

  getAchievementCount() {
    return this.achievements.length;
  },
};

const CHALLENGE_DATA = {
  challenges: [
    {
      id: 'daily_hops',
      name: 'Hop Master',
      description: 'Complete 10 hops in a single run',
      type: 'hops',
      target: 10,
      reward: 20,
    },
    {
      id: 'daily_coins',
      name: 'Coin Collector',
      description: 'Collect 20 coins in a single run',
      type: 'coinsCollected',
      target: 20,
      reward: 25,
    },
    {
      id: 'daily_distance',
      name: 'Distance Runner',
      description: 'Travel 5000 distance in endless mode',
      type: 'distance',
      target: 5000,
      reward: 30,
    },
    {
      id: 'daily_nearmiss',
      name: 'Close Call',
      description: 'Get 3 near misses in a single run',
      type: 'nearMisses',
      target: 3,
      reward: 15,
    },
    {
      id: 'daily_score',
      name: 'High Scorer',
      description: 'Reach a score of 500 in a single run',
      type: 'score',
      target: 500,
      reward: 35,
    },
    {
      id: 'daily_levels',
      name: 'Level Climber',
      description: 'Reach level 5 in a single run',
      type: 'levels',
      target: 5,
      reward: 40,
    },
    {
      id: 'daily_survive',
      name: 'Survivor',
      description: 'Survive for 3 minutes in endless mode',
      type: 'endlessTime',
      target: 180,
      reward: 25,
    },
    {
      id: 'daily_shield',
      name: 'Shield User',
      description: 'Use a shield to block a vehicle hit',
      type: 'shieldBlocks',
      target: 1,
      reward: 20,
    },
  ],

  getChallengeDef(id) {
    return this.challenges.find(c => c.id === id) || null;
  },
};

// Rolling-Frogger - Bonus Mode Data Definitions
// Rolling-Frogger - Vehicle Data Definitions
const VEHICLE_DATA = {
  baseSpeedDivisor: 12,
  vehiclesPerLaneBase: 2,
  vehiclesPerLaneScale: 1.5,
  speedMultiplierPerLevel: 0.1,
  densityMultiplierPerLevel: 0.15,
  maxDensityMultiplier: 3.0,
  vehicleWrapMargin: 100,
  types: [
    { id: 'car', key: 'car', group: 'cars', speedMod: 1.0 },
    { id: 'bus', key: 'bus', group: 'buses', speedMod: 0.6 },
    { id: 'truck', key: 'truck', group: 'trucks', speedMod: 0.8 }
  ]
};

const BONUS_MODE_DATA = {
  modes: [
    {
      id: 'time_trial',
      name: 'Time Trial',
      description: 'Beat the clock across lanes! Complete levels in 60 seconds.',
      icon: 'timer',
      color: '#ff4444',
      duration: 60,
      speedMultiplier: 1,
      scoreMultiplier: 1,
      noDeath: false,
      tags: ['timed', 'classic']
    },
    {
      id: 'no_miss',
      name: 'No Miss',
      description: 'Complete levels without any near misses.',
      icon: 'shield',
      color: '#44ffaa',
      speedMultiplier: 1,
      scoreMultiplier: 1.5,
      noDeath: false,
      strictNearMisses: true,
      tags: ['challenge', 'precision']
    },
    {
      id: 'speed_run',
      name: 'Speed Run',
      description: 'Traffic is 2x speed but rewards are 3x!',
      icon: 'bolt',
      color: '#ffaa00',
      speedMultiplier: 2,
      scoreMultiplier: 3,
      noDeath: false,
      tags: ['fast', 'reward']
    },
    {
      id: 'zen_mode',
      name: 'Zen Mode',
      description: 'No death, just score accumulation. Relax and play.',
      icon: 'leaf',
      color: '#44aaff',
      speedMultiplier: 1,
      scoreMultiplier: 1,
      noDeath: true,
      tags: ['relax', 'endless']
    }
  ],

  getMode(id) {
    return this.modes.find(m => m.id === id) || null;
  },

  getModesByTag(tag) {
    return this.modes.filter(m => m.tags.includes(tag));
  },

  getModeCount() {
    return this.modes.length;
  }
};
