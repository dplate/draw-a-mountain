import createTrack from "./createTrack.js";
import createLocomotive from "./createLocomotive.js";
import loadWheel from "./loadWheel.js";
import createCoach from "./createCoach.js";

export default async (scene, smoke, dispatcher) => {
  await createTrack(scene);
  const wheel = await loadWheel();
  const locomotive = await createLocomotive(scene, smoke, wheel);
  const coach1 = await createCoach(scene, wheel);
  const coach2 = await createCoach(scene, wheel);

  let offsetX = 0;

  dispatcher.listen('train', 'animate', ({elapsedTime}) => {
    const speed = 0.00002;
    const distance = elapsedTime * speed;
    offsetX += distance;
    if (offsetX > 1) {
      offsetX = 0;
    }
    locomotive.updatePosition(offsetX, speed);
    coach1.updatePosition(offsetX, 0);
    coach2.updatePosition(offsetX, 1);
    wheel.rotateWheels(distance);
  });

  return {
    entrances: [{
      terrainInfo: {
        point: new THREE.Vector3(0.9, 0, 0),
        normal: new THREE.Vector3(0, 1, 0),
        slope: 0,
        height: 0
      },
      exit: true
    }]
  };
};