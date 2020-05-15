const leftVector = new THREE.Vector3(-1, 0, 0);
const directionVector = new THREE.Vector3();

export default (position, target) => {
  directionVector.subVectors(target, position);
  directionVector.y = 0;
  let angle = leftVector.angleTo(directionVector);
  if (directionVector.z < 0) {
    angle = 2 * Math.PI - angle;
  }
  if (angle > Math.PI * 0.25 && angle <= Math.PI * 0.75) {
    return 'front';
  } else if (angle > Math.PI * 0.75 && angle <= Math.PI * 1.25) {
    return 'right';
  } else if (angle > Math.PI * 1.25 && angle <= Math.PI * 1.75) {
    return 'back';
  } else {
    return 'left';
  }
}