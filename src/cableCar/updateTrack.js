const SCALE_SUPPORT = 0.026;
const TRACK_WIDTH = 0.0235;

const calculateSecondaryFixPoint = (primaryFixPoint, mirror) => {
  const secondaryFixPoint = primaryFixPoint.clone();
  secondaryFixPoint.x -= TRACK_WIDTH * mirror;
  return secondaryFixPoint;
};

const calculateCurve = (fixPoints, secondary, mirror) => {
  const curvyFixPoints = fixPoints.reduce((all, primaryFixPoint) => {
    const fixPoint = secondary ? calculateSecondaryFixPoint(primaryFixPoint, mirror) : primaryFixPoint;
    if (all.length > 0) {
      const previousPoint = all[all.length - 1];
      const intermediatePoint = new THREE.Vector3();
      intermediatePoint.lerpVectors(previousPoint, fixPoint, 0.5);
      intermediatePoint.y -= previousPoint.distanceTo(fixPoint) / 150;
      return [
        ...all,
        intermediatePoint,
        fixPoint
      ]
    } else {
      return [ fixPoint ];
    }
  }, []);
  return new THREE.CatmullRomCurve3(curvyFixPoints);
};

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
  const minimumPrimaryHeight = SCALE_SUPPORT * 1.1;
  const minimumSecondaryHeight = SCALE_SUPPORT * 0.5;

  const lowest = { heightDiff: null };
  findLowestOnCurve(terrain, curveInfo.primaryCurve, minimumPrimaryHeight, 0, lowest);
  findLowestOnCurve(terrain, curveInfo.secondaryCurve, minimumSecondaryHeight, mirror * TRACK_WIDTH, lowest);

  return lowest && lowest.supportFixPoint;
};

const updateCable = (mesh, curve, mirror) => {
  const points = curve.getPoints(curve.getLength() * 20);
  mesh.geometry.setFromPoints(points);
  mesh.visible = true;
  mesh.userData.curve = curve;
  mesh.userData.mirror = mirror;
};

const updateCurveInfo = (curveInfo, fixPoints, mirror) => {
  curveInfo.fixPoints = fixPoints;
  curveInfo.primaryCurve = calculateCurve(fixPoints, false, mirror);
  curveInfo.secondaryCurve = calculateCurve(fixPoints, true, mirror);
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
  const fixPoints = [ topFixPoint, bottomFixPoint ];
  const curveInfo = {};
  updateCurveInfo(curveInfo, fixPoints, mirror);

  meshes.supports.forEach(support => support.visible = false);
  withSupports && placeSupports(terrain, meshes.supports, curveInfo, mirror);

  updateCable(meshes.primaryCable, curveInfo.primaryCurve, mirror);
  updateCable(meshes.secondaryCable, curveInfo.secondaryCurve, mirror);
}