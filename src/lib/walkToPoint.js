import getPersonDirection from "./getPersonDirection.js";

const walkVector = new THREE.Vector3();

export default (person, endPoint, elapsedTime) => {
  walkVector.subVectors(endPoint, person.position);
  if (walkVector.length() > 0.001) {
    walkVector.normalize()
    walkVector.z *= 30;
    walkVector.multiplyScalar(
      elapsedTime * 0.000005
    );
    person.animation = 'walking';
    person.position.add(walkVector);
    person.direction = getPersonDirection(person.position, endPoint);
    person.speed = person.baseSpeed;
    return false;
  } else {
    person.animation = 'standing';
    return true;
  }
};