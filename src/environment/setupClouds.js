import loadSvg from "../lib/loadSvg.js";

const MAX_CLOUDS = 10;

const setRandomProperties = (cloud) => {
  cloud.position.x = Math.random();
  cloud.position.y = 0.2 + Math.random() * 0.8;
  const scale = 0.07 + Math.random() * 0.1 * cloud.position.y;
  cloud.scale.x = scale;
  cloud.scale.y = scale;
  cloud.userData = {
    speed: -(0.000003 + Math.random() * 0.00004 * cloud.position.y),
    width: scale
  };
}

export default async (scene) => {
  const mesh = await loadSvg('cloud-1');
  const clouds = [];
  for (let i = 0; i < MAX_CLOUDS; i++) {
    const cloud = mesh.clone();
    setRandomProperties(cloud);
    clouds.push(cloud);
    scene.add(cloud);
  }

  return {
    onAnimate: ({elapsedTime}) => {
      clouds.forEach(cloud => {
        if (cloud.position.x + cloud.userData.width < 0) {
          setRandomProperties(cloud);
          cloud.position.x = 1;
        }
        cloud.translateX(elapsedTime * cloud.userData.speed);
      });
    }
  };
};