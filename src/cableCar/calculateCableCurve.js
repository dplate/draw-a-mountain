import trackWidth from './trackWidth.js';

const calculateSecondaryFixPoint = (primaryFixPoint, mirror) => {
  const secondaryFixPoint = primaryFixPoint.clone();
  secondaryFixPoint.x -= trackWidth * mirror;
  return secondaryFixPoint;
};

const calculateCarInfluence = (carTrackPosition, carZ, previousPoint, fixPoint) => {
  if (carTrackPosition !== null && carZ !== null && previousPoint.z <= carZ && fixPoint.z >= carZ) {
    const relativeCarPosition = 1 - (fixPoint.z - carZ) / (fixPoint.z - previousPoint.z);
    const weightInfluence = 4;
    return {
      intermediateFactor: Math.sin(-relativeCarPosition * 2 * Math.PI) * 0.25 + 0.5,
      weightFactor: (1 + weightInfluence - Math.cos(2 * Math.PI * relativeCarPosition)) / weightInfluence
    };
  }
  return {
    intermediateFactor: 0.5,
    weightFactor: 1
  };
}

export default (fixPoints, secondary, mirror, carTrackPosition = null, carZ = null) => {
  const curve = new THREE.CurvePath();
  let previousPoint = null;
  for (let i = 0; i < fixPoints.length; i++) {
    const fixPoint = secondary ? calculateSecondaryFixPoint(fixPoints[i], mirror) : fixPoints[i];
    if (previousPoint) {
      const carInfluence = calculateCarInfluence(carTrackPosition, carZ, previousPoint, fixPoint);

      const intermediatePoint = new THREE.Vector3();
      intermediatePoint.lerpVectors(previousPoint, fixPoint, carInfluence.intermediateFactor);
      intermediatePoint.y -= previousPoint.distanceTo(fixPoint) * carInfluence.weightFactor / 150;
      curve.add(new THREE.CatmullRomCurve3([previousPoint, intermediatePoint, fixPoint]));
    }
    previousPoint = fixPoint;
  }
  return curve;
};