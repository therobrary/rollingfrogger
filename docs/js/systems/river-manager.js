// Rolling-Frogger - River Manager System
// Manages river lanes, floating entities, player riding, and drowning logic

const RiverManager = {

  createRiverGroups(scene) {
    scene.logs = scene.physics.add.group();
    scene.turtles = scene.physics.add.group();
  },

  spawnRiverEntities(scene, safeZoneFrequency) {
    const riverLanes = LANE_DATA.riverLanes || [];
    const riverDefs = LANE_DATA.riverLaneDefs || [];
    const freqMult = safeZoneFrequency || 1;

    riverLanes.forEach((laneIndex, ri) => {
      const def = riverDefs[ri] || {};
      const entities = def.entities || [];
      let numEntities = entities.length || 3;

      // Adjust entity count based on difficulty director
      if (scene._difficultyDirector) {
        const densityMult = scene._difficultyDirector.getDensityMultiplier();
        const safeZoneFreq = scene._difficultyDirector.getSafeZoneFrequency();
        numEntities = Math.max(1, Math.floor(numEntities * densityMult * (1 / safeZoneFreq)));
      }

      const baseSpeed = def.speed || 80;
      const dir = def.direction || -1;

      for (let i = 0; i < numEntities; i++) {
        const entityDef = entities[i % entities.length] || { type: 'log', width: 56 };
        const x = Phaser.Math.Between(40, scene.gameWidth - 40);
        const y = LANE_DATA.getY(laneIndex, scene.gameHeight, LANE_DATA.TILE_SIZE);
        const speed = baseSpeed * (0.7 + Math.random() * 0.6) * dir;

        // Apply difficulty speed multiplier
        if (scene._difficultyDirector) {
          const speedMult = scene._difficultyDirector.getSpeedMultiplier();
          const adjustedSpeed = baseSpeed * speedMult * (0.7 + Math.random() * 0.6) * dir;
          const texture = entityDef.type === 'turtle' ? 'turtle' : 'log';
          const entity = new FloatingEntity(scene, x, y, texture, entityDef.type);
          entity.setSpeed(adjustedSpeed);
          entity.width = entityDef.width || 56;
          entity.setData('lane', laneIndex);
          entity.setData('speed', adjustedSpeed);
          entity.setDepth(4);
          entity.body.setAllowGravity(false);
          entity.body.setImmovable(true);
          entity.onWrap = (deltaX) => {
            if (scene.ridingEntity === entity) {
              scene.player.x += deltaX;
            }
          };

          if (entityDef.type === 'turtle') {
            scene.turtles.add(entity);
          } else {
            scene.logs.add(entity);
          }
        } else {
          const texture = entityDef.type === 'turtle' ? 'turtle' : 'log';
          const entity = new FloatingEntity(scene, x, y, texture, entityDef.type);
          entity.setSpeed(speed);
          entity.width = entityDef.width || 56;
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

          if (entityDef.type === 'turtle') {
            scene.turtles.add(entity);
          } else {
            scene.logs.add(entity);
          }
        }
      }
    });
  },

  updateRiverEntities(scene, dt) {
    const allEntities = [];
    scene.logs.getChildren().forEach(e => allEntities.push(e));
    scene.turtles.getChildren().forEach(e => allEntities.push(e));

    allEntities.forEach(entity => {
      if (!entity.active) return;
      entity.update(dt);
    });
  },

  checkPlayerOnFloating(scene) {
    if (!scene.player || !scene.gameActive) return false;

    const player = scene.player;
    const allEntities = [];
    scene.logs.getChildren().forEach(e => allEntities.push(e));
    scene.turtles.getChildren().forEach(e => allEntities.push(e));

    for (const entity of allEntities) {
      if (!entity.active) continue;
      if (entity.containsPlayer(player)) {
        if (scene.ridingEntity !== entity) {
          scene.ridingEntity = entity;
        }
        return true;
      }
    }

    if (scene.ridingEntity) {
      scene.ridingEntity = null;
    }
    return false;
  },

  movePlayerWithEntity(scene, dt) {
    if (!scene.ridingEntity || !scene.player || scene.playerMoving) return;
    const entity = scene.ridingEntity;
    const moveAmount = entity.speed * dt;
    scene.player.x += moveAmount;
  },

  // Drowning is checked after each player move, not per-frame in update().
  // This is safe because player movement is discrete (tile-based) and the
  // drowning check runs synchronously right after the player's hop completes,
  // so there is no risk of a player briefly touching water between moves.
  checkDrowning(scene) {
    if (!scene.player || !scene.gameActive || scene.drowning) return;

    const playerLane = scene.getPlayerLane();
    const isRiverLane = ModeManager.isEndless()
      ? (scene.riverLaneIndices && scene.riverLaneIndices.has(playerLane))
      : LANE_DATA.riverLanes.includes(playerLane);
    if (!isRiverLane) return;

    const onFloating = this.checkPlayerOnFloating(scene);
    if (onFloating) return;

    scene.drowning = true;
    scene.gameActive = false;

    const splashX = scene.player.x;
    const splashY = scene.player.y;

    const splash = scene.add.circle(splashX, splashY, 8, 0x88ccff, 0.8);
    splash.setDepth(15);
    scene.tweens.add({
      targets: splash,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 500,
      onComplete: () => splash.destroy()
    });

    const splashRing = scene.add.circle(splashX, splashY, 5, 0xaaddff, 0.6);
    splashRing.setDepth(15);
    scene.tweens.add({
      targets: splashRing,
      scaleX: 6,
      scaleY: 6,
      alpha: 0,
      duration: 600,
      onComplete: () => splashRing.destroy()
    });

    scene.player.setVisible(false);

    scene.time.delayedCall(GameConfig.deathPauseMs, () => {
      ScoreManager.onDrown(scene);
      scene.drowning = false;
      scene.player.setVisible(true);
      scene.player.setPosition(GameConfig.gameWidthHalf, scene.startRowY);
      if (ModeManager.isEndless()) {
        scene.cameras.main.setScroll(0, 0);
      }
    });
  },

  clearRiverEntities(scene) {
    scene.logs.clear(true, true);
    scene.turtles.clear(true, true);
    scene.ridingEntity = null;
  }
};
