import getPersonDirection from "./getPersonDirection.js";

const walkVector = new THREE.Vector3();

export default (person, endPoint, elapsedTime) => {
  walkVector.subVectors(endPoint, person.position);
  const distance = walkVector.length();
  if (distance > 0.0002) {
    walkVector.normalize()
    walkVector.multiplyScalar(
      Math.min(elapsedTime * 0.005 * person.baseSpeed, distance)
    );
    person.animation = 'walking';
    person.setDirection(getPersonDirection(person.position, endPoint));
    person.position.add(walkVector);
    person.position.z = endPoint.z;
    person.speed = person.baseSpeed;
    return false;
  } else {
    person.animation = 'standing';
    return true;
  }
};