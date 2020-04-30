const SCALE_CAR = 0.015;
const WAIT_TIME = 10000;

const updatePosition = (primaryCable, car) => {
  const { curve, mirror } = primaryCable.userData;
  const trackPosition = car.userData.trackPosition;

  const carFixPoint = curve.getPointAt(trackPosition);

  car.scale.x = mirror * SCALE_CAR;
  car.scale.y = SCALE_CAR;
  car.position.x = carFixPoint.x + 0.03 * SCALE_CAR * mirror;
  car.position.y = carFixPoint.y + 0.23 * SCALE_CAR;
  car.position.z = carFixPoint.z;
};

const calculateSpeed = (curve, trackPosition) => {
  const edge = 0.25 / curve.getLength();
  const edgeFactor = Math.min(trackPosition / edge, (1 - trackPosition) / edge, 1);
  const factor = 0.5 * (Math.sin(Math.PI*(edgeFactor - 0.5)) + 1);
  return (0.00001 + 0.0002 * factor) / curve.getLength();
};

const emitSmoke = (smoke, chimneyPoint) => {
  const maxLifeTime = 10000 + Math.random() * 5000;
  const maxScale = 0.01 + Math.random() * 0.01;
  smoke.add(chimneyPoint, 0.005, maxScale, maxLifeTime);
};

export default (smoke, meshes, elapsedTime) => {
  const {car, primaryCable, stationTop, stationBottom} = meshes;
  car.visible = true;

  if (car.userData.waitTimeLeft <= 0) {
    updatePosition(primaryCable, car);

    car.userData.trackPosition += car.userData.direction * calculateSpeed(
      primaryCable.userData.curve,
      car.userData.trackPosition
    ) * elapsedTime;

    if (car.userData.trackPosition >= 1) {
      car.userData.trackPosition = 1;
      car.userData.waitTimeLeft = WAIT_TIME;
      car.userData.direction = -1;
    } else if (car.userData.trackPosition <= 0) {
      car.userData.trackPosition = 0;
      car.userData.waitTimeLeft = WAIT_TIME;
      car.userData.direction = 1;
    }
  } else {
    car.userData.waitTimeLeft -= elapsedTime;

    if (car.userData.waitTimeLeft < 0) {
      if (car.userData.trackPosition < 1) {
        emitSmoke(smoke, stationTop.userData.chimneyPoint);
      } else {
        emitSmoke(smoke, stationBottom.userData.chimneyPoint);
      }
    }
  }
}