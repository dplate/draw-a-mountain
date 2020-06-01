import loadSvg from "../lib/loadSvg.js";

const SCALE_CAR = 0.08;

export default async (scene, wheels) => {
  const car = await loadSvg('train/coach');
  car.scale.x = SCALE_CAR;
  car.scale.y = SCALE_CAR;
  car.position.y = 0.0227;
  car.position.z = 0.1;
  car.visible = false;
  scene.add(car);

  const wheel1 = wheels.add(scene, false);
  const wheel2 = wheels.add(scene, false);
  const wheel3 = wheels.add(scene, false);
  const wheel4 = wheels.add(scene, false);

  return {
    updatePosition: (positionX, speed, carIndex) => {
      car.visible = true;
      car.position.x = positionX + SCALE_CAR * 0.495 - SCALE_CAR * 0.65 * carIndex;
      wheel1.position.x = car.position.x - SCALE_CAR * 0.345;
      wheel2.position.x = car.position.x - SCALE_CAR * 0.265;
      wheel3.position.x = car.position.x - SCALE_CAR * 0.095;
      wheel4.position.x = car.position.x - SCALE_CAR * 0.015;
    }
  }
};