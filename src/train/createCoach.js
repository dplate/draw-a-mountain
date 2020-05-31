import loadSvg from "../lib/loadSvg.js";

const SCALE_CAR = 0.08;

export default async (scene, wheel) => {
  const car = await loadSvg('train/coach');
  car.scale.x = SCALE_CAR;
  car.scale.y = SCALE_CAR;
  car.position.y = 0.0277;
  car.position.z = -0.0001
  scene.add(car);

  const wheel1 = wheel.clone(scene, false);
  const wheel2 = wheel.clone(scene, false);
  const wheel3 = wheel.clone(scene, false);
  const wheel4 = wheel.clone(scene, false);

  return {
    updatePosition: (offsetX, carIndex) => {
      car.position.x = offsetX - SCALE_CAR * 0.155 - SCALE_CAR * 0.65 * carIndex;
      wheel1.position.x = car.position.x - SCALE_CAR * 0.345;
      wheel2.position.x = car.position.x - SCALE_CAR * 0.265;
      wheel3.position.x = car.position.x - SCALE_CAR * 0.095;
      wheel4.position.x = car.position.x - SCALE_CAR * 0.015;
    }
  }
};