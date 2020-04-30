import trackWidth from "./trackWidth.js";
import calculateCableCurve from "./calculateCableCurve.js";
import updateCable from "./updateCable.js";

const SCALE_SUPPORT = 0.026;

const findLowestOnCurve = (terrain, curve, minimumHeight, supportOffsetX, lowest) => {
  const minSupportHeight = SCALE_SUPPORT * 1.5;
  const maxSupportHeight = SCALE_SUPPORT * 2.5;
  const edgeIgnoreFactor = 0.75 / curve.getLength();

  for (let factor = edgeIgnoreFactor; factor <= 1.0 - edgeIgnoreFactor; factor += 0.01) {
    const supportHeight = minSupportHeight + (maxSupportHeight - minSupportHeight) * (1 - Math.abs(0.5 - factor) / 0.5);
    const point = curve.getPoint(factor);
    const { point: { y: terrainY } } = terrain.getTerrainInfoAtPoint(point, true);
    const heightDiff = (point.y - minimumHeight) - terrainY;
    if (heightDiff < 0 && (lowest.heightDiff === null || lowest.heightDiff > heightDiff)) {
      const supportFixPoint = point.clone();
      supportFixPoint.x += supportOffsetX;
      supportFixPoint.y = terrainY + supportHeight;
      lowest.heightDiff = heightDiff;
      lowest.supportFixPoint = supportFixPoint;
    }
  }
}

const findSupportFixPoint = (terrain, curveInfo, mirror) => {
  const minimumPrimaryHeight = SCALE_SUPPORT * 1.2;
  const minimumSecondaryHeight = SCALE_SUPPORT * 0.5;

  const lowest = { heightDiff: null };
  findLowestOnCurve(terrain, curveInfo.primaryCurve, minimumPrimaryHeight, 0, lowest);
  findLowestOnCurve(terrain, curveInfo.secondaryCurve, minimumSecondaryHeight, mirror * trackWidth, lowest);

  return lowest && lowest.supportFixPoint;
};

const updateCurveInfo = (curveInfo, fixPoints, mirror) => {
  curveInfo.fixPoints = fixPoints;
  curveInfo.primaryCurve = calculateCableCurve(fixPoints, false, mirror);
  curveInfo.secondaryCurve = calculateCableCurve(fixPoints, true, mirror);
};

const placeSupports = (terrain, supports, curveInfo, mirror) => {
  if (supports.length > 0) {
    const support = supports[0];
    const supportFixPoint = findSupportFixPoint(terrain, curveInfo, mirror);
    if (supportFixPoint) {
      const newFixPoints = [ curveInfo.fixPoints[0] ];
      for (let i = 1; i < curveInfo.fixPoints.length; i++) {
        if (curveInfo.fixPoints[i - 1].z < supportFixPoint.z && supportFixPoint.z < curveInfo.fixPoints[i].z) {
          newFixPoints.push(supportFixPoint);
        }
        newFixPoints.push(curveInfo.fixPoints[i]);
      }
      updateCurveInfo(curveInfo, newFixPoints, mirror);
      support.visible = true;
      support.scale.x = mirror * SCALE_SUPPORT;
      support.scale.y = SCALE_SUPPORT;
      support.position.x = supportFixPoint.x - 0.45 * SCALE_SUPPORT * mirror;
      support.position.y = supportFixPoint.y + SCALE_SUPPORT * 0.2;
      support.position.z = supportFixPoint.z;

      placeSupports(terrain, supports.slice(1), curveInfo, mirror);
    }
  }
};

export default (terrain, meshes, withSupports) => {
  const topFixPoint = meshes.stationTop.userData.fixPoint;
  const bottomFixPoint = meshes.stationBottom.userData.fixPoint;
  const mirror = meshes.stationTop.userData.mirror;
  const fixPoints = [topFixPoint, bottomFixPoint];
  const curveInfo = {};
  updateCurveInfo(curveInfo, fixPoints, mirror);

  meshes.supports.forEach(support => support.visible = false);
  withSupports && placeSupports(terrain, meshes.supports, curveInfo, mirror);

  updateCable(meshes.primaryCable, curveInfo.primaryCurve);
  meshes.primaryCable.userData.mirror = mirror;
  meshes.primaryCable.userData.fixPoints = curveInfo.fixPoints;
  updateCable(meshes.secondaryCable, curveInfo.secondaryCurve);
}