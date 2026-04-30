// Rolling-Frogger - Lane Configuration
// Lane layout from bottom to top (index 0 = bottom road lane, index 9 = school goal)
//
//   Index 9  = School goal (safe, non-traversable except via overlap)
//   Index 8  = Sidewalk / bike lane
//   Index 7  = Safe zone (grass)
//   Index 6  = Road lane (vehicles travel right)
//   Index 5  = Road lane (vehicles travel right)
//   Index 4  = Road lane (vehicles travel right)
//   Index 3  = Median (safe concrete zone)
//   Index 2  = Road lane (vehicles travel left)
//   Index 1  = Road lane (vehicles travel left)
//   Index 0  = Road lane (vehicles travel left)
//   Start row = below lane 0 (spawn zone, sidewalk tile)

const LANE_DATA = {
  // Total number of lanes (excluding the start row)
  TOTAL_LANES: 10,

  // Tile size used for lane Y-position calculations
  TILE_SIZE: 48,

  // Lane definitions in index order (0 = bottom road lane, 9 = school goal)
  lanes: [
    { index: 0,  type: 'road',    direction: -1, label: 'TRAFFIC' },
    { index: 1,  type: 'road',    direction: -1, label: 'TRAFFIC' },
    { index: 2,  type: 'road',    direction: -1, label: 'TRAFFIC' },
    { index: 3,  type: 'median',  direction:  0, label: 'MEDIAN' },
    { index: 4,  type: 'road',    direction:  1, label: 'TRAFFIC' },
    { index: 5,  type: 'road',    direction:  1, label: 'TRAFFIC' },
    { index: 6,  type: 'road',    direction:  1, label: 'TRAFFIC' },
    { index: 7,  type: 'safe',    direction:  0, label: 'SAFE ZONE' },
    { index: 8,  type: 'sidewalk',direction:  0, label: 'BIKE LANE' },
    { index: 9,  type: 'school',  direction:  0, label: 'SCHOOL' },
  ],

  // Traffic lanes only (lanes where vehicles spawn and move)
  trafficLanes: [
    { lane: 0, dir: -1 },
    { lane: 1, dir: -1 },
    { lane: 2, dir: -1 },
    { lane: 4, dir:  1 },
    { lane: 5, dir:  1 },
    { lane: 6, dir:  1 },
  ],

  // Road lanes (where vehicles can travel)
  roadLanes: [0, 1, 2, 4, 5, 6],

  // Left-road lanes (vehicles travel left, direction -1)
  leftRoadLanes: [0, 1, 2],

  // Right-road lanes (vehicles travel right, direction +1)
  rightRoadLanes: [4, 5, 6],

  // Safe zones (non-road lanes)
  safeLanes: [3, 7, 8, 9],

  // Median lane index
  medianLane: 3,

  // School goal lane index
  schoolLane: 9,

  // Sidewalk/bike lane index
  sidewalkLane: 8,

  // Safe zone lane index (above median)
  safeZoneLane: 7,

  // Number of road lanes per side (left and right)
  lanesPerSide: 3,

  // Width of school goal tiles in lane 9 (centered)
  schoolTileCount: 3,

  // Number of goal bays (matching classic Frogger's 5 frog homes)
  goalBayCount: 5,

  // Row offset from bottom for the first traffic lane (start row is 1 row below lane 0)
  startRowOffset: 2,

  // Computes the Y position (center) for a given lane index
  // Formula: y = gameHeight - (laneIndex + 2) * tileSize + tileSize / 2
  getY: function(laneIndex, gameHeight, tileSize) {
    return gameHeight - (laneIndex + 2) * tileSize + tileSize / 2;
  },

  // Computes the lane index from a player Y position
  // Formula: lane = round((startRowY - playerY) / tileSize) - 1
  getLaneFromY: function(playerY, startRowY, tileSize) {
    return Math.round((startRowY - playerY) / tileSize) - 1;
  },

  // Endless mode lane templates - procedural generator uses these as building blocks
  // Each template defines a sequence of lane types for a section
  endlessTemplates: {
    roadSection: [
      { type: 'road', direction: -1 },
      { type: 'road', direction: -1 },
      { type: 'road', direction: 1 },
      { type: 'road', direction: 1 },
      { type: 'safe', direction: 0 },
      { type: 'road', direction: -1 },
      { type: 'road', direction: 1 },
      { type: 'safe', direction: 0 },
    ],
    riverSection: [
      { type: 'river', direction: 0 },
      { type: 'river', direction: 0 },
      { type: 'road', direction: -1 },
      { type: 'safe', direction: 0 },
      { type: 'river', direction: 0 },
      { type: 'road', direction: 1 },
    ],
    mixedSection: [
      { type: 'road', direction: -1 },
      { type: 'river', direction: 0 },
      { type: 'safe', direction: 0 },
      { type: 'road', direction: 1 },
      { type: 'river', direction: 0 },
      { type: 'safe', direction: 0 },
      { type: 'road', direction: -1 },
      { type: 'road', direction: 1 },
    ],
    safeSection: [
      { type: 'safe', direction: 0 },
      { type: 'safe', direction: 0 },
      { type: 'road', direction: -1 },
      { type: 'safe', direction: 0 },
      { type: 'road', direction: 1 },
      { type: 'safe', direction: 0 },
    ],
  },

  // Endless mode: available road lane types for procedural generation
  endlessRoadTypes: ['road-left', 'road-right'],

  // Endless mode: section size range (number of lanes per section)
  endlessSectionMinSize: 8,
  endlessSectionMaxSize: 12,
};
