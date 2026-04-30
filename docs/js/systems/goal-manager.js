// Rolling-Frogger - Goal Manager System
// Manages multiple goal bays in the school lane

const GoalManager = {

  createGoalBays(scene) {
    if (!scene.goalBays) {
      scene.goalBays = [];
    }

    const laneY = LANE_DATA.getY(LANE_DATA.schoolLane, scene.gameHeight, scene.tileSize);
    const centerX = scene.gameWidth / 2;
    const baySpacing = scene.tileSize;
    const totalWidth = LANE_DATA.goalBayCount * baySpacing;
    const startX = centerX - totalWidth / 2 + baySpacing / 2;

    for (let i = 0; i < LANE_DATA.goalBayCount; i++) {
      const bay = new GoalBay(i, startX + i * baySpacing, laneY, scene);
      scene.goalBays.push(bay);
    }

    scene.goalBayGroups = scene.add.group();
    scene.goalBays.forEach(bay => {
      if (bay.getSprite()) {
        scene.goalBayGroups.add(bay.getSprite());
      }
    });

    this.updateGoalVisuals(scene);
  },

  checkGoalReached(scene) {
    if (!scene.player || !scene.goalBays) return null;

    const player = scene.player;
    for (const bay of scene.goalBays) {
      if (bay.isEmpty()) {
        const dx = Math.abs(player.x - bay.x);
        const dy = Math.abs(player.y - bay.y);
        if (dx < scene.tileSize * 0.6 && dy < scene.tileSize * 0.6) {
          return bay;
        }
      }
    }
    return null;
  },

  fillBay(scene, bayIndex) {
    if (!scene.goalBays || !scene.goalBays[bayIndex]) return false;
    const bay = scene.goalBays[bayIndex];
    if (bay.filled) return false;

    bay.fill();
    bay.updateVisuals();
    scene.score += GameConfig.scoreBayFill;
    return true;
  },

  allBaysFilled(scene) {
    if (!scene.goalBays) return false;
    return scene.goalBays.every(bay => bay.filled);
  },

  getFilledCount(scene) {
    if (!scene.goalBays) return 0;
    return scene.goalBays.filter(bay => bay.filled).length;
  },

  clearGoalBays(scene) {
    if (scene.goalBays) {
      scene.goalBays.forEach(bay => bay.destroy());
      scene.goalBays = [];
    }
    // Clear children but keep the group alive so existing physics overlap handlers remain valid
    if (scene.goalBayGroups) {
      scene.goalBayGroups.clear(true, true);
    }
  },

  updateGoalVisuals(scene) {
    if (!scene.goalBays) return;
    scene.goalBays.forEach(bay => bay.updateVisuals());
  }
};
