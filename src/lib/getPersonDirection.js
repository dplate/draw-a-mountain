const leftVector = new THREE.Vector3(-1, 0, 0);
const directionVector = new THREE.Vector3();

export default (position, target) => {
  directionVector.subVectors(target, position);
  directionVector.y = 0;
  let angle = leftVector.angleTo(directionVector);
  if (directionVector.z < 0) {
    angle = 2 * Math.PI - angle;
  }
  if (angle > Math.PI * 0.45 && angle <= Math.PI * 0.55) {
    return 'front';
  } else if (angle > Math.PI * 0.55 && angle <= Math.PI * 1.45) {
    return 'right';
  } else if (angle > Math.PI * 1.45 && angle <= Math.PI * 1.55) {
    return 'back';
  } else {
    return 'left';
  }
}