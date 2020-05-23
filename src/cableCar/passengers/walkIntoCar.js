import walkToPoint from "./walkToPoint.js";

const pointInCar = new THREE.Vector3();

const createCarOffset = (car, person, passengerIndex) => {
  const offset = new THREE.Vector3();
  const side = (passengerIndex % 2) ? -1 : 1;
  const maxJitter = car.scale.x / 4;
  const jitter = Math.random() * maxJitter - maxJitter / 2;

  offset.x = side * car.scale.x / 6 + jitter;
  offset.y = -car.scale.y * 1.85;
  offset.z = -0.01 * person.scale;

  return offset;
};

export default (passengerGroup, elapsedTime) => {
  let allAtEnd = true;
  passengerGroup.passengers.forEach((passenger, index) => {
    if (!passenger.carOffset) {
      const passengerIndex = passengerGroup.car.userData.usedCapacity - passengerGroup.passengers.length + index;
      passenger.carOffset = createCarOffset(passengerGroup.car, passenger.person, passengerIndex)
    }
    pointInCar.addVectors(passengerGroup.car.position, passenger.carOffset);
    if (!walkToPoint(passenger.person, pointInCar, elapsedTime)) {
      allAtEnd = false;
    }
  });
  return allAtEnd;
};

