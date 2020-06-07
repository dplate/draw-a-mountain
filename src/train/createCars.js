import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const SCALE_CAR = 0.08;

export default async (scene, wheels, svgName, count) => {
  const instancedObject = await createInstancedObjectFromSvg(scene, svgName);
  const cars = [];
  for (let i = 0; i < count; i++) {
    const car = instancedObject.addInstance();
    car.scale.x = SCALE_CAR;
    car.scale.y = SCALE_CAR;
    car.position.x = -1.0;
    car.position.y = 0.0227;
    car.position.z = 0.1;

    const wheel1 = wheels.add(false);
    const wheel2 = wheels.add(false);
    const wheel3 = wheels.add(false);
    const wheel4 = wheels.add(false);

    cars.push({
      updatePosition: (positionX, speed, carIndex) => {
        car.position.x = positionX + SCALE_CAR * 0.495 - SCALE_CAR * 0.65 * carIndex;
        wheel1.position.x = car.position.x - SCALE_CAR * 0.345;
        wheel2.position.x = car.position.x - SCALE_CAR * 0.265;
        wheel3.position.x = car.position.x - SCALE_CAR * 0.095;
        wheel4.position.x = car.position.x - SCALE_CAR * 0.015;
        car.update();
      }
    });
  }
  return cars;
};