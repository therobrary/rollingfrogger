// Rolling-Frogger - Content Loader / Validator
// Validates LANE_DATA and VEHICLE_DATA at boot time before the game starts.

const ContentLoader = {

  validate() {
    const errors = [];

    this._validateVehicleData(errors);
    this._validateLaneData(errors);

    if (errors.length > 0) {
      console.error('[ContentLoader] Content validation failed:', errors);
      return { valid: false, errors };
    }

    console.log('[ContentLoader] Content validation passed.');
    return { valid: true, errors: [] };
  },

  _validateVehicleData(errors) {
    if (typeof VEHICLE_DATA === 'undefined') {
      errors.push('VEHICLE_DATA is not defined.');
      return;
    }

    if (!Array.isArray(VEHICLE_DATA.types)) {
      errors.push('VEHICLE_DATA.types is not an array.');
      return;
    }

    const seenKeys = new Set();
    VEHICLE_DATA.types.forEach((v, i) => {
      if (!v.key) {
        errors.push(`VEHICLE_DATA.types[${i}] missing 'key'.`);
      }
      if (!v.asset) {
        errors.push(`VEHICLE_DATA.types[${i}] (${v.key || 'unnamed'}) missing 'asset' file path.`);
      } else if (!v.asset.endsWith('.png')) {
        errors.push(`VEHICLE_DATA.types[${i}] (${v.key}) asset '${v.asset}' does not end with .png.`);
      }
      if (!v.group) {
        errors.push(`VEHICLE_DATA.types[${i}] (${v.key || 'unnamed'}) missing 'group'.`);
      }
      if (typeof v.speedMod !== 'number' || v.speedMod <= 0) {
        errors.push(`VEHICLE_DATA.types[${i}] (${v.key || 'unnamed'}) speedMod must be a positive number, got ${v.speedMod}.`);
      }
      if (seenKeys.has(v.key)) {
        errors.push(`VEHICLE_DATA.types[${i}] duplicate key '${v.key}'.`);
      }
      seenKeys.add(v.key);
    });
  },

  _validateLaneData(errors) {
    if (typeof LANE_DATA === 'undefined') {
      errors.push('LANE_DATA is not defined.');
      return;
    }

    if (!Array.isArray(LANE_DATA.lanes)) {
      errors.push('LANE_DATA.lanes is not an array.');
      return;
    }

    const indices = LANE_DATA.lanes.map(l => l.index);
    const sorted = [...indices].sort((a, b) => a - b);

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i) {
        errors.push(`LANE_DATA.lanes indices are not contiguous. Expected ${i}, found gap at index ${i}.`);
        break;
      }
    }

    if (Array.isArray(LANE_DATA.trafficLanes)) {
      LANE_DATA.trafficLanes.forEach((tl, i) => {
        if (typeof tl.lane !== 'number') {
          errors.push(`LANE_DATA.trafficLanes[${i}] missing numeric 'lane' property.`);
        } else if (!indices.includes(tl.lane)) {
          errors.push(`LANE_DATA.trafficLanes[${i}] references lane index ${tl.lane} which does not exist in LANE_DATA.lanes.`);
        }
        if (typeof tl.dir !== 'number') {
          errors.push(`LANE_DATA.trafficLanes[${i}] ('lane': ${tl.lane}) missing numeric 'dir' property.`);
        }
      });
    }

    if (typeof LANE_DATA.TILE_SIZE !== 'number' || LANE_DATA.TILE_SIZE <= 0) {
      errors.push(`LANE_DATA.TILE_SIZE must be a positive number, got ${LANE_DATA.TILE_SIZE}.`);
    }

    if (typeof LANE_DATA.TOTAL_LANES !== 'number') {
      errors.push('LANE_DATA.TOTAL_LANES is not defined or not a number.');
    }

    if (LANE_DATA.TOTAL_LANES !== LANE_DATA.lanes.length) {
      errors.push(`LANE_DATA.TOTAL_LANES (${LANE_DATA.TOTAL_LANES}) does not match lanes.length (${LANE_DATA.lanes.length}).`);
    }

    LANE_DATA.lanes.forEach((lane, i) => {
      if (!lane.type) errors.push(`LANE_DATA.lanes[${i}] missing 'type'.`);
      if (typeof lane.direction !== 'number') errors.push(`LANE_DATA.lanes[${i}] missing numeric 'direction'.`);
      if (!lane.label) errors.push(`LANE_DATA.lanes[${i}] missing 'label'.`);
    });
  }
};
