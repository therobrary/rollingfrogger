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
    { id: 'vehicle_car', key: 'vehicle_car', asset: 'vehicle_car_red.png', color: 0xdd3333, fallbackWidth: 48, group: 'cars', speedMod: 1.0 },
    { id: 'vehicle_car_alt', key: 'vehicle_car_alt', asset: 'vehicle_car_green.png', color: 0x33aa55, fallbackWidth: 48, group: 'cars', speedMod: 1.0 },
    { id: 'vehicle_sedan', key: 'vehicle_sedan', asset: 'vehicle_sedan_purple.png', color: 0x7b2d8b, fallbackWidth: 48, group: 'cars', speedMod: 1.0 },
    { id: 'vehicle_sports', key: 'vehicle_sports', asset: 'vehicle_sports_yellow.png', color: 0xffcc00, fallbackWidth: 44, group: 'cars', speedMod: 1.1 },
    { id: 'vehicle_hatchback', key: 'vehicle_hatchback', asset: 'vehicle_hatchback_teal.png', color: 0x22aaaa, fallbackWidth: 44, group: 'cars', speedMod: 1.0 },
    { id: 'vehicle_bus', key: 'vehicle_bus', asset: 'vehicle_bus_yellow.png', color: 0xddaa00, fallbackWidth: 64, group: 'buses', speedMod: 0.8 },
    { id: 'vehicle_van', key: 'vehicle_van', asset: 'vehicle_van_orange.png', color: 0xdd8800, fallbackWidth: 64, group: 'buses', speedMod: 0.85 },
    { id: 'vehicle_truck', key: 'vehicle_truck', asset: 'vehicle_truck_blue.png', color: 0x3366cc, fallbackWidth: 56, group: 'trucks', speedMod: 0.85 },
    { id: 'vehicle_suv', key: 'vehicle_suv', asset: 'vehicle_suv_white.png', color: 0xcccccc, fallbackWidth: 56, group: 'trucks', speedMod: 0.9 },
    { id: 'vehicle_pickup', key: 'vehicle_pickup', asset: 'vehicle_pickup_red.png', color: 0xcc2222, fallbackWidth: 56, group: 'trucks', speedMod: 0.9 }
  ]
};


