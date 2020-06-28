import getPersonDirection from './getPersonDirection.js';

const startPoint2d = new THREE.Vector3();
const endPoint2d = new THREE.Vector3();
const walkVector = new THREE.Vector3();

export default (person, endPoint, elapsedTime) => {
  startPoint2d.copy(person.position);
  startPoint2d.z = 0;
  endPoint2d.copy(endPoint);
  endPoint2d.z = 0;
  walkVector.subVectors(endPoint2d, startPoint2d);
  const distance = walkVector.length();
  walkVector.normalize()
  const walkDistance = Math.min(elapsedTime * 0.005 * person.baseSpeed, distance);
  walkVector.multiplyScalar(walkDistance);
  person.position.add(walkVector);
  const walkZ = (endPoint.z - person.position.z) * (distance <= 0 ? 1 : (walkDistance / distance));
  person.position.z += walkZ;

  if (walkDistance >= distance) {
    if (person.animation === 'walking') {
      person.animation = 'standing';
    }
    return true;
  } else {
    person.animation = 'walking';
    person.setDirection(getPersonDirection(startPoint2d, endPoint2d));
    person.speed = person.baseSpeed;
    return false;
  }
};