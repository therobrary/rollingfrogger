// Rolling-Frogger - Traffic Spawner System
// Handles vehicle groups, spawning, and traffic update/wrapping
const TrafficSpawner = {

  createVehicleGroups(scene) {
    scene.cars = scene.physics.add.group();
    scene.buses = scene.physics.add.group();
    scene.trucks = scene.physics.add.group();
  },

  createTraffic(scene, laneDirections, bonusSpeedMultiplier, diffSpeedMult, diffDensityMult) {
    // Combine difficulty director multipliers with level-based scaling
    const diffSpeed = diffSpeedMult || 1;
    const diffDensity = diffDensityMult || 1;
    const levelSpeedMultiplier = 1 + (scene.level - 1) * VEHICLE_DATA.speedMultiplierPerLevel;
    const speedMultiplier = levelSpeedMultiplier * (bonusSpeedMultiplier || 1) * diffSpeed;
    const levelDensityMultiplier = Math.min(1 + (scene.level - 1) * VEHICLE_DATA.densityMultiplierPerLevel, VEHICLE_DATA.maxDensityMultiplier);
    const densityMultiplier = Math.min(levelDensityMultiplier * diffDensity, VEHICLE_DATA.maxDensityMultiplier);
    const baseSpeed = scene.gameWidth / VEHICLE_DATA.baseSpeedDivisor;

    // Get hazard variety from difficulty director
    let hazardVariety = 1;
    if (scene._difficultyDirector) {
      hazardVariety = scene._difficultyDirector.getHazardVariety();
    }

    laneDirections.forEach((laneInfo) => {
      const { lane, dir } = laneInfo;
      const maxVehicles = Math.floor(VEHICLE_DATA.vehiclesPerLaneBase + VEHICLE_DATA.vehiclesPerLaneScale * densityMultiplier);
      const vehiclesPerLane = Phaser.Math.Between(1, Math.max(1, maxVehicles));
      const laneOffset = Phaser.Math.Between(0, 100);

      for (let j = 0; j < vehiclesPerLane; j++) {
        // Select vehicle type based on hazard variety
        let vType;
        if (scene._difficultyDirector && hazardVariety > 1) {
          const availableTypes = VEHICLE_DATA.types.filter(t => {
            if (BalanceData && BalanceData.hazardTypes) {
              const hazardDef = BalanceData.hazardTypes.find(h => h.id === t.id);
              if (hazardDef) {
                const level = scene._difficultyDirector.getDifficultyLevel();
                return level >= hazardDef.minDifficulty;
              }
            }
            return true;
          });
          vType = availableTypes.length > 0 ? Phaser.Utils.Array.GetRandom(availableTypes) : Phaser.Utils.Array.GetRandom(VEHICLE_DATA.types);
        } else {
          vType = Phaser.Utils.Array.GetRandom(VEHICLE_DATA.types);
        }

        const group = scene[vType.group];
        const speed = baseSpeed * speedMultiplier * vType.speedMod;

        const spacing = scene.gameWidth / (vehiclesPerLane + 1);
        const x = spacing * (j + 1) + laneOffset + Phaser.Math.Between(-40, 40);
        const y = scene.gameHeight - (lane + LANE_DATA.startRowOffset) * LANE_DATA.TILE_SIZE + LANE_DATA.TILE_SIZE / 2;

        const vehicle = group.create(x, y, vType.key);
        vehicle.setData('speed', speed * dir);
        vehicle.setData('lane', lane);
        vehicle.setDepth(5);
        if (vehicle.body) vehicle.body.setVelocityX(speed * dir);
      }
    });
  },

  updateTraffic(scene, time) {
    const margin = VEHICLE_DATA.vehicleWrapMargin;
    const left = -margin;
    const right = scene.gameWidth + margin;

    [scene.cars, scene.buses, scene.trucks].forEach(group => {
      group.getChildren().forEach(vehicle => {
        if (!vehicle.active) return;
        const speed = vehicle.getData('speed');
        if (speed > 0 && vehicle.x > right) {
          vehicle.x = left;
        } else if (speed < 0 && vehicle.x < left) {
          vehicle.x = right;
        }
      });
    });
  },

  clearTraffic(scene) {
    scene.cars.clear(true, true);
    scene.buses.clear(true, true);
    scene.trucks.clear(true, true);
  }
};
