class LaneRenderer {

  drawPlayfield(scene, gameWidth, tileSize) {
    const laneY = [];
    for (let i = 0; i < LANE_DATA.TOTAL_LANES; i++) {
      laneY.push(LANE_DATA.getY(i, scene.gameHeight, tileSize));
    }

    const centerX = gameWidth / 2;

    // Bottom safe start row
    for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
      scene.add.image(tx * tileSize + tileSize / 2, scene.startRowY, 'tile_sidewalk')
        .setAlpha(0.9);
    }

    // Bottom road lanes (left) - vehicles travel left
    for (const lane of LANE_DATA.leftRoadLanes) {
      for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
        scene.add.image(tx * tileSize + tileSize / 2, laneY[lane], 'tile_road');
      }
      for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
        scene.add.image(tx * tileSize + tileSize / 2, laneY[lane], 'lane_marker')
          .setAlpha(0.4);
      }
    }

     // River lane
    const riverLanes = LANE_DATA.riverLanes || [];
    for (const riverLaneIdx of riverLanes) {
      for (let tx = 0; tx < Math.ceil(gameWidth / tileSize) + 1; tx++) {
        scene.add.image(tx * tileSize - tileSize / 4, laneY[riverLaneIdx], 'tile_water');
      }
      const waveColor = `rgba(100,180,255,0.3)`;
      for (let wx = 0; wx < Math.ceil(gameWidth / (tileSize * 0.75)); wx++) {
        const wave = scene.add.circle(
          wx * tileSize * 0.75 + tileSize * 0.375,
          laneY[riverLaneIdx],
          12,
          0x66aadd
        );
        wave.setAlpha(0.15);
        wave.setDepth(0);
      }
      scene.add.text(12, laneY[riverLaneIdx] - 8, LANE_DATA.lanes[riverLaneIdx].label, {
        fontSize: '9px',
        fontFamily: 'Arial, sans-serif',
        color: '#66aaff',
        fontStyle: 'bold'
      }).setDepth(1);
    }

    // Top road lanes (right) - vehicles travel right
    for (const lane of LANE_DATA.rightRoadLanes) {
      for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
        scene.add.image(tx * tileSize + tileSize / 2, laneY[lane], 'tile_road');
      }
      for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
        scene.add.image(tx * tileSize + tileSize / 2, laneY[lane], 'lane_marker')
          .setAlpha(0.4);
      }
    }

    // Safe zone above river
    const safeZoneLane = LANE_DATA.safeZoneLane;
    for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
      scene.add.image(tx * tileSize + tileSize / 2, laneY[safeZoneLane], 'tile_grass');
    }

    // Lane label for safe zone
    scene.add.text(12, laneY[safeZoneLane] - 8, LANE_DATA.lanes[safeZoneLane].label, {
      fontSize: '9px',
      fontFamily: 'Arial, sans-serif',
      color: '#66cc66',
      fontStyle: 'bold'
    }).setDepth(1);

    // Sidewalk/bike lane
    const sidewalkLane = LANE_DATA.sidewalkLane;
    for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
      scene.add.image(tx * tileSize + tileSize / 2, laneY[sidewalkLane], 'tile_sidewalk');
    }

    // Lane label for sidewalk
    scene.add.text(12, laneY[sidewalkLane] - 8, LANE_DATA.lanes[sidewalkLane].label, {
      fontSize: '9px',
      fontFamily: 'Arial, sans-serif',
      color: '#6699cc',
      fontStyle: 'bold'
    }).setDepth(1);

    // School goal - grass on sides, multiple goal bays
    const schoolLane = LANE_DATA.schoolLane;
    for (let tx = 0; tx < Math.ceil(gameWidth / tileSize); tx++) {
      scene.add.image(tx * tileSize + tileSize / 2, laneY[schoolLane], 'tile_grass');
    }

    // School label with glow effect
    scene.add.text(centerX, laneY[schoolLane], 'SCHOOL - WSHS', {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffdd44',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // Direction arrows for traffic lanes
    const laneDirections = LANE_DATA.trafficLanes;

    // Start line indicator
    scene.add.rectangle(centerX, scene.startRowY + 20, gameWidth, 2, 0x44ff88)
      .setAlpha(0.5)
      .setDepth(1);

    scene.add.text(centerX, scene.startRowY + 12, 'START', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#44ff88',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    return { laneDirections, laneY };
  }

  drawTrafficArrows(scene, laneDirections, laneY) {
    const arrowX = scene.gameWidth - 24;
    const arrowColors = ['#ff6666', '#ffaa44', '#ff6666', '#66aaff', '#66dd66', '#66aaff'];

    laneDirections.forEach((info, idx) => {
      scene.add.text(arrowX, laneY[info.lane], info.dir === -1 ? '◄' : '►', {
        fontSize: '14px',
        color: arrowColors[idx] || '#888888',
        align: 'center'
      }).setAlpha(0.3).setDepth(1);
    });
  }
}
