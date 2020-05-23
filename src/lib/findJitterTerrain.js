import findNearestTerrain from "./findNearestTerrain.js";

const jitterPosition = new THREE.Vector3();
const direction = new THREE.Vector3();
const zVector = new THREE.Vector3(0, 0, 1);

export default (terrain, startPoint, endPoint, maxJitter = 2) => {
  direction.subVectors(endPoint, startPoint);
  direction.z = 0;
  direction.normalize().multiplyScalar(0.007);
  const angle = Math.PI * (Math.random() * maxJitter - maxJitter / 2);
  direction.applyAxisAngle(zVector, angle);
  jitterPosition.addVectors(endPoint, direction);
  return findNearestTerrain(terrain, jitterPosition);
}