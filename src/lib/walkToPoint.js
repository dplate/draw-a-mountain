import getPersonDirection from "./getPersonDirection.js";

const walkVector = new THREE.Vector3();

export default (person, endPoint, elapsedTime) => {
  walkVector.subVectors(endPoint, person.position);
  if (walkVector.length() > 0.0002) {
    walkVector.normalize()
    walkVector.multiplyScalar(
      elapsedTime * 0.005 * person.baseSpeed
    );
    person.animation = 'walking';
    person.position.add(walkVector);
    person.position.z = endPoint.z;
    person.direction = getPersonDirection(person.position, endPoint);
    person.speed = person.baseSpeed;
    return false;
  } else {
    person.animation = 'standing';
    return true;
  }
};