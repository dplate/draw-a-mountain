import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const MAX_CLOUDS = 10;

const setRandomProperties = (cloud) => {
  cloud.position.x = Math.random();
  cloud.position.y = 0.2 + Math.random() * 0.8;
  cloud.position.z = -9.0;
  const scale = 0.07 + Math.random() * 0.1 * cloud.position.y;
  cloud.scale.x = scale;
  cloud.scale.y = scale;
  cloud.userData.speed = -(0.000003 + Math.random() * 0.00004 * cloud.position.y);
  cloud.userData.width = scale;
}

export default async (scene, dispatcher) => {
  const instancedObject = await createInstancedObjectFromSvg(scene, 'clouds/cumulus');
  const clouds = [];
  for (let i = 0; i < MAX_CLOUDS; i++) {
    const cloud = instancedObject.addInstance();
    setRandomProperties(cloud);
    clouds.push(cloud);
  }

  dispatcher.listen('clouds', 'animate', ({elapsedTime}) => {
    clouds.forEach(cloud => {
      if (cloud.position.x + cloud.userData.width / 2 < 0) {
        setRandomProperties(cloud);
        cloud.position.x = 1 + cloud.userData.width / 2;
      }
      cloud.position.x = cloud.position.x + elapsedTime * cloud.userData.speed;
      cloud.update();
    });
  });
};