// Rolling-Frogger - Scroll Manager System
// Handles camera scrolling and section transitions in endless mode

const ScrollManager = {
  SCROLL_TARGET_Y: 96, // Target Y position when scrolling to a new section

  // Update scroll state - handles section transitions as player moves up
  updateScroll(scene, delta) {
    if (!scene.isEndless()) return;
    if (!scene.gameActive) return;

    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;
    const playerLane = scene.getPlayerLane();

    // Check if player has crossed into a new section
    const currentSectionEnd = scene.currentSectionStart + scene.currentSectionSize;
    const lanesAhead = currentSectionEnd - playerLane;

    // Generate next section if player is within 3 lanes of the end
    if (lanesAhead <= 3 && (!scene.nextSection || scene.nextSection.generated !== true)) {
      this.generateNextSection(scene);
    }

    // Camera follows player vertically
    if (scene.isEndless) {
      const targetScrollY = -(playerLane * tileSize);
      const currentScrollY = scene.cameras.main.scrollY;
      const diff = targetScrollY - currentScrollY;

      if (Math.abs(diff) > tileSize * 0.3) {
        scene.cameras.main.scrollY += diff * 0.05;
      }
    }
  },

  // Generate the next section of lanes for endless mode
  generateNextSection(scene) {
    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;

    // Calculate difficulty based on distance traveled
    const distance = scene.distance || 0;
    const difficulty = Math.min(distance / 100, 3); // Cap at difficulty 3

    // Generate next section with incremented seed
    const sectionSeed = scene.endlessSeed + scene.sectionsGenerated;
    const sectionData = ProceduralGenerator.generateSection(sectionSeed, difficulty);

    scene.nextSection = {
      data: sectionData,
      generated: false,
      difficulty: difficulty,
    };

    // Pre-generate if we can
    this.tryApplyNextSection(scene);
  },

  // Apply the pre-generated next section when needed
  tryApplyNextSection(scene) {
    if (!scene.nextSection || scene.nextSection.generated) return;

    const playerLane = scene.getPlayerLane();
    const currentSectionEnd = scene.currentSectionStart + scene.currentSectionSize;

    // Only apply when player is close enough to the end
    if (currentSectionEnd - playerLane > 5) return;

    const sectionData = scene.nextSection.data;
    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;

    // Remove old lanes beyond player view
    this.removeOldLanes(scene);

    // Add new lane tiles
    this.drawSectionLanes(scene, sectionData, scene.currentSectionStart + scene.currentSectionSize);

    // Spawn traffic for the new section
    this.spawnSectionTraffic(scene, sectionData, scene.currentSectionStart + scene.currentSectionSize);

    // Spawn river entities for the new section
    this.spawnSectionRiverEntities(scene, sectionData, scene.currentSectionStart + scene.currentSectionSize);

    // Mark section as generated
    scene.nextSection.generated = true;
    scene.currentSectionStart += scene.currentSectionSize;
    scene.currentSectionSize = sectionData.sectionSize;
    scene.sectionsGenerated++;

    // Clear the next section
    scene.nextSection = null;
  },

  // Draw lane tiles for a generated section
  drawSectionLanes(scene, sectionData, baseLaneIndex) {
    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;
    const gameHeight = scene.gameHeight;
    const gameWidth = scene.gameWidth;

    if (ModeManager.isEndless()) {
      scene.riverLaneIndices = new Set();
    }

    sectionData.lanes.forEach((lane) => {
      const laneIndex = baseLaneIndex + lane.index;
      const y = gameHeight - (laneIndex + 2) * tileSize + tileSize / 2;

      // Draw lane tiles
      const tileCount = Math.ceil(gameWidth / tileSize) + 1;
      for (let tx = 0; tx < tileCount; tx++) {
        let tileKey = 'tile_road';
        if (lane.type === 'river') {
          tileKey = 'tile_water';
        } else if (lane.type === 'safe') {
          tileKey = 'tile_grass';
        } else if (lane.type === 'goal') {
          tileKey = 'tile_grass';
        }

        scene.add.image(
          tx * tileSize + tileSize / 2,
          y,
          tileKey
        ).setDepth(0);

        // Add lane markers for road lanes
        if (lane.type === 'road') {
          scene.add.image(
            tx * tileSize + tileSize / 2,
            y,
            'lane_marker'
          ).setAlpha(0.4).setDepth(0);
        }
      }

      // Add river waves if river lane
      if (lane.type === 'river') {
        if (ModeManager.isEndless()) {
          scene.riverLaneIndices.add(baseLaneIndex + lane.index);
        }
        scene.add.text(12, y - 8, lane.label, {
          fontSize: '9px',
          fontFamily: 'Arial, sans-serif',
          color: '#66aaff',
          fontStyle: 'bold'
        }).setDepth(1);

        for (let wx = 0; wx < Math.ceil(gameWidth / (tileSize * 0.75)); wx++) {
          const wave = scene.add.circle(
            wx * tileSize * 0.75 + tileSize * 0.375,
            y,
            12,
            0x66aadd
          );
          wave.setAlpha(0.15).setDepth(0);
        }
      }

      // Add safe zone label
      if (lane.type === 'safe') {
        scene.add.text(12, y - 8, lane.label, {
          fontSize: '9px',
          fontFamily: 'Arial, sans-serif',
          color: '#66cc66',
          fontStyle: 'bold'
        }).setDepth(1);
      }

      // Add checkpoint label
      if (lane.type === 'goal') {
        scene.add.text(gameWidth / 2, y, 'CHECKPOINT', {
          fontSize: '14px',
          fontFamily: 'Arial Black, Arial, sans-serif',
          color: '#ffdd44',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
      }
    });
  },

  // Spawn traffic for a generated section
  spawnSectionTraffic(scene, sectionData, baseLaneIndex) {
    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;
    const gameWidth = scene.gameWidth;
    const difficulty = scene.distance ? Math.min(scene.distance / 100, 3) : 0;

    const speedMultiplier = ProceduralGenerator.getTrafficSpeedMultiplier(difficulty);
    const densityMultiplier = ProceduralGenerator.getVehicleDensityMultiplier(difficulty);
    const baseSpeed = gameWidth / VEHICLE_DATA.baseSpeedDivisor;

    sectionData.lanes.forEach((lane) => {
      if (lane.type !== 'road') return;

      const laneIndex = baseLaneIndex + lane.index;
      const maxVehicles = Math.floor(
        VEHICLE_DATA.vehiclesPerLaneBase +
        VEHICLE_DATA.vehiclesPerLaneScale * densityMultiplier
      );
      const vehiclesPerLane = Phaser.Math.Between(1, Math.max(1, maxVehicles));
      const laneOffset = Phaser.Math.Between(0, 100);

      for (let j = 0; j < vehiclesPerLane; j++) {
        const vType = Phaser.Utils.Array.GetRandom(VEHICLE_DATA.types);
        const group = scene[vType.group];
        const speed = baseSpeed * speedMultiplier * vType.speedMod;
        const dir = lane.direction || 1;

        const spacing = gameWidth / (vehiclesPerLane + 1);
        const x = spacing * (j + 1) + laneOffset + Phaser.Math.Between(-40, 40);
        const spawnY = scene.gameHeight - (laneIndex + 2) * tileSize + tileSize / 2;

        const vehicle = group.create(x, spawnY, vType.key);
        vehicle.setData('speed', speed * dir);
        vehicle.setData('lane', laneIndex);
        vehicle.setDepth(5);
        if (vehicle.body) vehicle.body.setVelocityX(speed * dir);
      }
    });
  },

  // Spawn river entities for a generated section
  spawnSectionRiverEntities(scene, sectionData, baseLaneIndex) {
    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;
    const gameHeight = scene.gameHeight;
    const difficulty = scene.distance ? Math.min(scene.distance / 100, 3) : 0;
    const riverDensityMultiplier = ProceduralGenerator.getRiverDensityMultiplier(difficulty);

    sectionData.lanes.forEach((lane) => {
      if (lane.type !== 'river') return;

      const laneIndex = baseLaneIndex + lane.index;
      const y = gameHeight - (laneIndex + 2) * tileSize + tileSize / 2;

      // Spawn 2-4 floating entities per river lane
      const numEntities = Math.floor(2 + riverDensityMultiplier);
      const dir = lane.direction || -1;

      for (let i = 0; i < numEntities; i++) {
        const isTurtle = Math.random() < 0.3;
        const texture = isTurtle ? 'turtle' : 'log';
        const entity = new FloatingEntity(scene, Phaser.Math.Between(40, scene.gameWidth - 40), y, texture, isTurtle ? 'turtle' : 'log');
        const baseSpeed = 80 * (0.7 + Math.random() * 0.6);
        const speed = baseSpeed * dir;

        entity.setSpeed(speed);
        entity.width = isTurtle ? 56 : 56;
        entity.setData('lane', laneIndex);
        entity.setData('speed', speed);
        entity.setDepth(4);
        entity.body.setAllowGravity(false);
        entity.body.setImmovable(true);

        entity.onWrap = (deltaX) => {
          if (scene.ridingEntity === entity) {
            scene.player.x += deltaX;
          }
        };

        if (isTurtle) {
          scene.turtles.add(entity);
        } else {
          scene.logs.add(entity);
        }
      }
    });
  },

  // Remove lanes that are far below the player
  removeOldLanes(scene) {
    const tileSize = scene.tileSize || LANE_DATA.TILE_SIZE;
    const playerLane = scene.getPlayerLane();
    const removeThreshold = playerLane - 5;

    // Remove objects below the threshold (simple approach - just let them wrap)
    // Full lane removal would require tracking which objects belong to which section
    // For now, we rely on vehicle wrapping behavior
  },

  // Handle checkpoint reached in endless mode
  onCheckpointReached(scene) {
    const checkpointBonus = 200;
    scene.score += checkpointBonus;
    scene.distance += scene.currentSectionSize;

    // Visual feedback for checkpoint
    const flash = scene.add.rectangle(
      scene.gameWidth / 2,
      scene.gameHeight / 2,
      scene.gameWidth,
      scene.gameHeight,
      0x44ff88,
      0.3
    ).setDepth(200);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    ScoreManager.updateHUD(scene);
  },
};
