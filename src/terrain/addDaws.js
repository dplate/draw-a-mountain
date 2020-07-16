import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';
import getRandomFromList from '../lib/getRandomFromList.js';

const SCALE_DAW = 0.005;
const MAX_Y_DISTANCE = 0.01;
const MAX_DURATION = 5000;
const MAX_SPEED = 0.000005;
const zAxis = new THREE.Vector3(0, 0, 1);

const findPeaks = (ridgeHeights) => {
  const peaks = [];

  let lastPeakY = 100;
  let best;
  do {
    best = null;
    for (let index = 1; index < ridgeHeights.length - 1; index++) {
      const x = index / ridgeHeights.length;
      const y = ridgeHeights[index];
      const leftSlope = y - ridgeHeights[index - 1];
      const rightSlope = y - ridgeHeights[index + 1];
      const maxSlope = Math.max(leftSlope, rightSlope);
      const minDistance = peaks.reduce((minDistance, peak) => Math.min(minDistance, Math.abs(peak.x - x)), 100);
      if (
        y < lastPeakY &&
        (best === null || y > best.peak.y || (y === best.peak.y && maxSlope > best.maxSlope)) &&
        x > 0.1 && x < 0.9 &&
        minDistance > 0.15 &&
        leftSlope >= 0 && rightSlope >= 0 && maxSlope > 0
      ) {
        best = {peak: {x, y}, maxSlope: maxSlope};
      }
    }
    if (best) {
      peaks.push(best.peak);
      lastPeakY = best.peak.y;
    }
  } while (best && peaks.length < 3)

  return peaks;
}

const createDaw = (instancedShapes, peak) => {
  const daw = {
    shapes: instancedShapes.map(instancedShape => instancedShape.addInstance()),
    current: null,
    peak,
    speedX: 0,
    speedY: 0,
    duration: 0,
    angle: 0,
    shapeDuration: 0,
  };
  daw.shapes.forEach(shape => {
    shape.scale.set(SCALE_DAW, SCALE_DAW, SCALE_DAW);
    shape.position.set(peak.x, peak.y, -7);
  });
  daw.current = daw.shapes[0];
  return daw;
};

const createDaws = (instancedShapes, peaks) => {
  const daws = [];
  peaks.forEach(peak => {
    for (let i = 0; i < 1 + Math.random() * 5; i++) {
      daws.push(createDaw(instancedShapes, peak));
    }
  });
  return daws;
};

const animateDaws = (daws, elapsedTime) => {
  daws.forEach(daw => {
    daw.shapeDuration -= elapsedTime;
    if (daw.shapeDuration < 0) {
      const newShape = getRandomFromList(daw.shapes);
      const oldShape = daw.current;
      if (newShape !== oldShape) {
        newShape.position.copy(oldShape.position);
        oldShape.position.x = -1;
        oldShape.update();
        daw.current = newShape;
      }
      daw.shapeDuration = MAX_DURATION + Math.random() * MAX_DURATION;
    }

    const durationFactor = daw.duration / MAX_DURATION;
    daw.current.position.x += elapsedTime * daw.speedX * durationFactor;
    daw.current.position.y += elapsedTime * daw.speedY * durationFactor;
    daw.angle += elapsedTime * ((daw.speedY - daw.speedX / 2 > 0 ? 1 : -1) * durationFactor - daw.angle) * 0.001;
    daw.current.quaternion.setFromAxisAngle(zAxis, daw.angle);
    daw.current.update();

    daw.duration -= elapsedTime;
    if (daw.duration < 0) {
      const directionX = daw.current.position.x > daw.peak.x ? -1 : 1;
      const directionY = (daw.current.position.y > (daw.peak.y + MAX_Y_DISTANCE)) ? -1 : 1;
      daw.speedX = directionX * (MAX_SPEED + Math.random() * MAX_SPEED);
      daw.speedY = directionY * (MAX_SPEED + Math.random() * MAX_SPEED) * (directionY < 0 ? 1 : 0.5);
      daw.duration = Math.random() * MAX_DURATION;
    }
  });
};

export default async (scene, ridgeHeights, dispatcher) => {
  const instancedShapes = [
    await createInstancedObjectFromSvg(scene, 'animals/daw-right'),
    await createInstancedObjectFromSvg(scene, 'animals/daw-front')
  ];
  const peaks = findPeaks(ridgeHeights);
  const daws = createDaws(instancedShapes, peaks);

  dispatcher.listen('daws', 'animate', async ({elapsedTime}) => animateDaws(daws, elapsedTime));
}