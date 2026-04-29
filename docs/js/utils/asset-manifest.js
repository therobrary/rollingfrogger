// Rolling-Frogger - Asset Manifest
// Maps all asset keys to their file paths for use by BootScene preload.

const AssetManifest = {

  assetBase: 'assets/',

  build() {
    const manifest = {};

    // Player asset
    manifest.player = `${this.assetBase}player_student.png`;

    // Vehicle assets from VEHICLE_DATA.types
    if (typeof VEHICLE_DATA !== 'undefined' && Array.isArray(VEHICLE_DATA.types)) {
      for (const vType of VEHICLE_DATA.types) {
        manifest[vType.key] = `${this.assetBase}${vType.asset}`;
      }
    }

    // Tile assets
    manifest.tile_road = `${this.assetBase}tile_road.png`;
    manifest.tile_median = `${this.assetBase}tile_median.png`;
    manifest.tile_grass = `${this.assetBase}tile_grass.png`;
    manifest.tile_sidewalk = `${this.assetBase}tile_sidewalk.png`;
    manifest.tile_school = `${this.assetBase}tile_school_goal.png`;
    manifest.tile_bg_dark = `${this.assetBase}tile_bg_dark.png`;

    // Utility assets
    manifest.lane_marker = `${this.assetBase}lane_marker.png`;
    manifest.obstacle_cone = `${this.assetBase}obstacle_cone.png`;

    // Bike asset
    manifest.bike = `${this.assetBase}bike_green.png`;

    return manifest;
  }
};
