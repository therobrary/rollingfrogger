// Rolling-Frogger - Vehicle Type Definitions
// Maps sprite keys to physics groups and speed modifiers.
// Preserves the randomized mixed-vehicle pool from the original game.

const VEHICLE_DATA = {
  // Physics group categories used for collision handling
  groups: ['cars', 'buses', 'trucks'],

  // Vehicle roster: each type maps to a sprite key, physics group, and speed modifier
  // Speed modifier is multiplied by baseSpeed * levelMultiplier in createTraffic()
  types: [
    // Cars (group: 'cars')
    { key: 'vehicle_car',     group: 'cars',  speedMod: 1.0, asset: 'vehicle_car_red.png',     color: 0xdd3333, fallbackWidth: 48 },
    { key: 'vehicle_car_alt', group: 'cars',  speedMod: 1.0, asset: 'vehicle_car_green.png',  color: 0x33aa55, fallbackWidth: 48 },
    { key: 'vehicle_sedan',   group: 'cars',  speedMod: 1.0, asset: 'vehicle_sedan_purple.png', color: 0x7b2d8b, fallbackWidth: 48 },
    { key: 'vehicle_sports',  group: 'cars',  speedMod: 1.1, asset: 'vehicle_sports_yellow.png', color: 0xffcc00, fallbackWidth: 44 },
    { key: 'vehicle_hatchback', group: 'cars', speedMod: 1.0, asset: 'vehicle_hatchback_teal.png', color: 0x22aaaa, fallbackWidth: 44 },

    // Buses (group: 'buses')
    { key: 'vehicle_bus',  group: 'buses', speedMod: 0.8, asset: 'vehicle_bus_yellow.png',  color: 0xddaa00, fallbackWidth: 64 },
    { key: 'vehicle_van',  group: 'buses', speedMod: 0.85, asset: 'vehicle_van_orange.png', color: 0xdd8800, fallbackWidth: 64 },

    // Trucks (group: 'trucks')
    { key: 'vehicle_truck', group: 'trucks', speedMod: 0.85, asset: 'vehicle_truck_blue.png', color: 0x3366cc, fallbackWidth: 56 },
    { key: 'vehicle_suv',   group: 'trucks', speedMod: 0.9, asset: 'vehicle_suv_white.png',  color: 0xcccccc, fallbackWidth: 56 },
    { key: 'vehicle_pickup',group: 'trucks', speedMod: 0.9, asset: 'vehicle_pickup_red.png', color: 0xcc2222, fallbackWidth: 56 },
  ],

  // Total number of vehicle types in the pool
  typeCount: 10,

  // Base speed for traffic (pixels per second at level 1)
  // Formula: baseSpeed = gameWidth / 3
  baseSpeedDivisor: 3,

  // Speed scaling per level
  // Formula: speedMultiplier = 1 + (level - 1) * 0.06
  speedMultiplierPerLevel: 0.06,

  // Vehicle density scaling per level
  // Formula: maxVehicles = floor(2 + 2 * densityMultiplier), densityMultiplier = min(1 + (level-1)*0.10, 1.5)
  densityMultiplierPerLevel: 0.10,
  maxDensityMultiplier: 1.5,

  // Vehicles per lane at base level (1-4 scaled by density)
  minVehiclesPerLane: 1,
  maxBaseVehiclesPerLane: 4,

  // Base vehicles per lane and scale factor for density
  vehiclesPerLaneBase: 2,
  vehiclesPerLaneScale: 2,

  // Screen wrap margin for vehicles (pixels beyond edge before wrapping)
  vehicleWrapMargin: 80,
};

// Pickup/Bonus Economy Data
const PICKUP_DATA = {
  // Pickup type definitions: key, points awarded, currency value, spawn weight, sprite key
  // Spawn weights sum to 100: coin=50, star=25, shield=12, magnet=8, key=5
  types: [
    { key: 'coin',      points: 0,    currencyValue: 1,  spawnWeight: 50, spriteKey: 'pickup_coin' },
    { key: 'star',      points: 50,   currencyValue: 0,  spawnWeight: 25, spriteKey: 'pickup_star' },
    { key: 'shield',    points: 0,    currencyValue: 0,  spawnWeight: 12, spriteKey: 'pickup_shield' },
    { key: 'magnet',    points: 0,    currencyValue: 0,  spawnWeight: 8,  spriteKey: 'pickup_magnet' },
    { key: 'key',       points: 100,  currencyValue: 5,  spawnWeight: 5,  spriteKey: 'pickup_key' },
  ],
  typeCount: 5,

  // Magnet effect duration in milliseconds
  magnetDurationMs: 5000,

  // Pickup collection radius (pixels)
  collectionRadius: 28,

  // Max pickups on screen at once
  maxPickupsOnScreen: 20,
};


