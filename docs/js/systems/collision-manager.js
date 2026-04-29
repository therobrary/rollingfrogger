// Rolling-Frogger - Collision Manager System
// Handles overlap and collider setup for player-vehicle and vehicle-vehicle collisions
const CollisionManager = {

  setupCollisions(scene) {
    // Player vs vehicles (all types)
    scene.physics.add.overlap(scene.player, scene.cars, () => CollisionManager.hitByVehicleHandler(scene), null, scene);
    scene.physics.add.overlap(scene.player, scene.buses, () => CollisionManager.hitByVehicleHandler(scene), null, scene);
    scene.physics.add.overlap(scene.player, scene.trucks, () => CollisionManager.hitByVehicleHandler(scene), null, scene);

    // Vehicle-to-vehicle collisions (only within same lane)
    const sameLane = (a, b) => a.getData('lane') === b.getData('lane');
    scene.physics.add.collider(scene.cars, scene.cars, null, sameLane);
    scene.physics.add.collider(scene.buses, scene.buses, null, sameLane);
    scene.physics.add.collider(scene.trucks, scene.trucks, null, sameLane);
    scene.physics.add.collider(scene.cars, scene.buses, null, sameLane);
    scene.physics.add.collider(scene.cars, scene.trucks, null, sameLane);
    scene.physics.add.collider(scene.buses, scene.trucks, null, sameLane);
  },

  hitByVehicleHandler(scene) {
    if (PickupManager.checkShieldHit(scene)) return;
    ScoreManager.onHitByVehicle(scene);
  },

  setupGoalOverlap(scene) {
    scene.physics.add.overlap(scene.player, scene.goalBayGroups, () => CollisionManager.reachGoalHandler(scene), null, scene);
  },

  reachGoalHandler(scene) {
    ScoreManager.onReachGoal(scene);
  }
};
