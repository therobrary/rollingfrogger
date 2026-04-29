// Rolling-Frogger - Procedural Generator System
// Generates lane sections for endless mode using seeded random

const ProceduralGenerator = {

  // Seeded PRNG (mulberry32) for reproducible runs
  createRng(seed) {
    let s = seed | 0;
    return function() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // Returns a seeded random number between min and max (inclusive)
  randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  },

  // Returns a random element from an array
  randChoice(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  },

  // Shuffle array in place and return it
  shuffle(rng, arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Determine lane pattern based on difficulty (0.0 to 1.0+)
  // Difficulty increases with distance: more traffic, fewer safe zones
  choosePattern(rng, difficulty) {
    const patterns = [
      'traffic-sparse',
      'traffic-moderate',
      'traffic-dense',
      'river-mixed',
      'safe-corridor',
      'road-transition',
      'goal-approach',
    ];

    // Weight patterns based on difficulty
    const weights = [
      Math.max(0, 3 - difficulty * 2),         // traffic-sparse
      Math.max(0, 4 - difficulty),              // traffic-moderate
      Math.min(3, difficulty * 1.5),            // traffic-dense
      Math.max(0, 3 - difficulty * 1.2),        // river-mixed
      Math.max(0, 2 - difficulty * 1.5),        // safe-corridor
      Math.max(0, 2.5 - difficulty),            // road-transition
      Math.max(0, 1 - difficulty * 0.5),        // goal-approach
    ];

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * totalWeight;
    for (let i = 0; i < patterns.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return patterns[i];
    }
    return 'traffic-moderate';
  },

  // Generate a single section of lanes for endless mode
  // Each section has 8-12 lanes with varying types
  generateSection(seed, difficulty) {
    const rng = this.createRng(seed);
    const sectionSize = this.randInt(rng, 8, 12);
    const pattern = this.choosePattern(rng, difficulty);

    // Lane type definitions for endless mode
    const laneTypes = {
      'road-left': { type: 'road', direction: -1, label: 'TRAFFIC' },
      'road-right': { type: 'road', direction: 1, label: 'TRAFFIC' },
      'river': { type: 'river', direction: -1, label: 'RIVER' },
      'safe': { type: 'safe', direction: 0, label: 'SAFE' },
      'goal': { type: 'goal', direction: 0, label: 'CHECKPOINT' },
    };

    const roads = ['road-left', 'road-left', 'road-right', 'road-right'];
    const sections = [];

    switch (pattern) {
      case 'traffic-sparse': {
        // Mostly road with occasional safe zones
        for (let i = 0; i < sectionSize; i++) {
          if (rng() < 0.15 && i > 0 && i < sectionSize - 1) {
            sections.push({ ...laneTypes['safe'], index: i });
          } else {
            const roadType = this.randChoice(rng, roads);
            sections.push({ ...laneTypes[roadType], index: i });
          }
        }
        break;
      }
      case 'traffic-moderate': {
        // Mix of roads and safe zones
        const roadCount = Math.floor(sectionSize * (0.6 + difficulty * 0.2));
        const safeCount = sectionSize - roadCount;
        for (let i = 0; i < sectionSize; i++) {
          if (i < safeCount) {
            sections.push({ ...laneTypes['safe'], index: i });
          } else {
            const roadType = this.randChoice(rng, roads);
            sections.push({ ...laneTypes[roadType], index: i });
          }
        }
        break;
      }
      case 'traffic-dense': {
        // Mostly road with minimal safe zones
        const safeCount = Math.max(1, Math.floor(sectionSize * (0.15 - difficulty * 0.05)));
        for (let i = 0; i < sectionSize; i++) {
          if (i < safeCount) {
            sections.push({ ...laneTypes['safe'], index: i });
          } else {
            const roadType = this.randChoice(rng, roads);
            sections.push({ ...laneTypes[roadType], index: i });
          }
        }
        break;
      }
      case 'river-mixed': {
        // Mix of river and road lanes
        const riverCount = Math.max(1, Math.floor(sectionSize * (0.2 + difficulty * 0.05)));
        let idx = 0;
        for (let i = 0; i < riverCount && idx < sectionSize; i++, idx++) {
          sections.push({ ...laneTypes['river'], index: idx });
        }
        if (idx < sectionSize) {
          sections.push({ ...laneTypes['safe'], index: idx++ });
        }
        while (idx < sectionSize) {
          const roadType = this.randChoice(rng, roads);
          sections.push({ ...laneTypes[roadType], index: idx++ });
        }
        break;
      }
      case 'safe-corridor': {
        // Safe zones with some road lanes for breathing room
        const roadCount = Math.max(1, Math.floor(sectionSize * 0.3));
        for (let i = 0; i < sectionSize; i++) {
          if (i < roadCount) {
            const roadType = this.randChoice(rng, roads);
            sections.push({ ...laneTypes[roadType], index: i });
          } else {
            sections.push({ ...laneTypes['safe'], index: i });
          }
        }
        break;
      }
      case 'road-transition': {
        // Transition between road-left and road-right
        const midPoint = Math.floor(sectionSize / 2);
        for (let i = 0; i < sectionSize; i++) {
          if (i === midPoint) {
            sections.push({ ...laneTypes['safe'], index: i });
          } else if (i < midPoint) {
            sections.push({ ...laneTypes['road-left'], index: i });
          } else {
            sections.push({ ...laneTypes['road-right'], index: i });
          }
        }
        break;
      }
      case 'goal-approach': {
        // End of section: safe zone with checkpoint
        const safeCount = Math.min(sectionSize - 1, Math.max(1, Math.floor(sectionSize * 0.2)));
        const roadEnd = sectionSize - 1 - safeCount;
        for (let i = 0; i < roadEnd; i++) {
          const roadType = this.randChoice(rng, roads);
          sections.push({ ...laneTypes[roadType], index: i });
        }
        for (let i = roadEnd; i < sectionSize - 1; i++) {
          sections.push({ ...laneTypes['safe'], index: i });
        }
        sections.push({ ...laneTypes['goal'], index: sectionSize - 1 });
        break;
      }
      default: {
        for (let i = 0; i < sectionSize; i++) {
          const roadType = this.randChoice(rng, roads);
          sections.push({ ...laneTypes[roadType], index: i });
        }
      }
    }

    return {
      sectionSize,
      lanes: sections,
      pattern,
    };
  },

  // Get traffic speed multiplier based on difficulty
  getTrafficSpeedMultiplier(difficulty) {
    return 1 + difficulty * 0.4;
  },

  // Get vehicle density multiplier based on difficulty
  getVehicleDensityMultiplier(difficulty) {
    return Math.min(1 + difficulty * 0.5, 2.0);
  },

  // Get river entity density multiplier
  getRiverDensityMultiplier(difficulty) {
    return Math.min(1 + difficulty * 0.3, 1.8);
  },

  // Check if a lane index is a safe lane
  isSafeLane(lane) {
    return lane.type === 'safe' || lane.type === 'goal';
  },

  // Check if a lane index is a river lane
  isRiverLane(lane) {
    return lane.type === 'river';
  },

  // Check if a lane index is a road lane
  isRoadLane(lane) {
    return lane.type === 'road';
  },
};
