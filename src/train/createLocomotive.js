import loadSvg from "../lib/loadSvg.js";

const SCALE_CAR = 0.08;

export default async (scene, smoke, wheel) => {
  const car = await loadSvg('train/locomotive');
  car.scale.x = SCALE_CAR;
  car.scale.y = SCALE_CAR;
  car.position.y = 0.0277;
  car.position.z = -0.0001
  scene.add(car);

  const trailerWheel1 = wheel.clone(scene, false);
  const trailerWheel2 = wheel.clone(scene, false);
  const bigWheel1 = wheel.clone(scene, true);
  const bigWheel2 = wheel.clone(scene, true);
  const smallWheel1 = wheel.clone(scene, false);
  const smallWheel2 = wheel.clone(scene, false);

  let distanceForNextSmoke = 0;
  const chimneyPoint = new THREE.Vector3();

  return {
    updatePosition: (offsetX, speed) => {
      car.position.x = offsetX + SCALE_CAR * 0.5;
      trailerWheel1.position.x = offsetX + SCALE_CAR * 0.12;
      trailerWheel2.position.x = offsetX + SCALE_CAR * 0.25;
      bigWheel1.position.x = offsetX + SCALE_CAR * 0.4;
      bigWheel2.position.x = offsetX + SCALE_CAR * 0.55;
      smallWheel1.position.x = offsetX + SCALE_CAR * 0.67;
      smallWheel2.position.x = offsetX + SCALE_CAR * 0.77;

      distanceForNextSmoke -= speed * 20;
      if (distanceForNextSmoke < 0) {
        distanceForNextSmoke = 0.01 + Math.random() * 0.01;
        chimneyPoint.copy(car.position);
        chimneyPoint.x += SCALE_CAR * 0.24;
        chimneyPoint.y += SCALE_CAR * 0.08;
        chimneyPoint.z -= 0.0001;

        const smokeLifeTime = 2000 + Math.random() * 2000;
        smoke.add(
          chimneyPoint,
          0.01,
          0.01 + 0.3 * smokeLifeTime * speed,
          smokeLifeTime,
          speed
        );
      }
    }
  }
};