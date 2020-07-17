import loadSvg from '../lib/loadSvg.js';
import {MIN_Z} from '../lib/constants.js';

const SCALE_CAR = 0.08;

export default async (scene, audio, smoke, wheels) => {
  const car = await loadSvg('train/locomotive');
  car.scale.x = SCALE_CAR;
  car.scale.y = SCALE_CAR;
  car.position.y = 0.0227;
  car.position.z = 0.1;
  car.visible = false;
  scene.add(car);

  const steamSound = await audio.load('train/steam', true);
  const brakeSound = await audio.load('train/brake');

  const trailerWheel1 = wheels.add(false);
  const trailerWheel2 = wheels.add(false);
  const bigWheel1 = wheels.add(true);
  const bigWheel2 = wheels.add(true);
  const smallWheel1 = wheels.add(false);
  const smallWheel2 = wheels.add(false);

  let distanceForNextSmoke = 0;
  const chimneyPoint = new THREE.Vector3();
  let lastPositionX = 0;

  return {
    updatePosition: (positionX, speed, carIndex, elapsedTime) => {
      car.visible = true;
      car.position.x = positionX + SCALE_CAR * 0.5;
      trailerWheel1.position.x = positionX + SCALE_CAR * 0.12;
      trailerWheel2.position.x = positionX + SCALE_CAR * 0.25;
      bigWheel1.position.x = positionX + SCALE_CAR * 0.4;
      bigWheel2.position.x = positionX + SCALE_CAR * 0.55;
      smallWheel1.position.x = positionX + SCALE_CAR * 0.67;
      smallWheel2.position.x = positionX + SCALE_CAR * 0.77;

      distanceForNextSmoke -= speed * elapsedTime;
      if (distanceForNextSmoke < 0) {
        distanceForNextSmoke = 0.01 + Math.random() * 0.01;
        chimneyPoint.copy(car.position);
        chimneyPoint.x += SCALE_CAR * 0.24;
        chimneyPoint.y += SCALE_CAR * 0.08;
        chimneyPoint.z -= MIN_Z;

        const smokeLifeTime = 2000 + Math.random() * 2000;
        smoke.add(
          chimneyPoint,
          0.01,
          0.01 + 0.3 * smokeLifeTime * speed,
          smokeLifeTime,
          speed
        );
      }
      if (speed > 0) {
        steamSound.play();
        const fadeInOut = Math.max(0, Math.min(positionX < 0 ? (0.1 + positionX) / 0.1 : (1.2 - positionX) / 0.2, 1));
        const speedFactor = speed / 0.0001;
        steamSound.setPosition(car.position);
        steamSound.setVolume(fadeInOut * speedFactor);
        steamSound.setPlaybackRate(speedFactor);
        steamSound.setDetune(Math.log2(1.0 / speedFactor) * 1200);

        if (lastPositionX < 0.65 && positionX >= 0.65) {
          brakeSound.playAtPosition(car.position);
        }
      } else {
        steamSound.stop();
      }
      lastPositionX = positionX;
    }
  }
};