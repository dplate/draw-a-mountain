import loadSvg from "../lib/loadSvg.js";

const SCALE_BIG = 0.01;
const SCALE_SMALL = 0.005;

export default async () => {
  const wheels = [];
  const mesh = await loadSvg('train/wheel');
  mesh.children.forEach(child => {
    child.geometry.translate(0, 0.5, 0);
  });

  return {
    add: (scene, big) => {
      const wheel = mesh.clone();
      if (big) {
        wheel.scale.x = SCALE_BIG;
        wheel.scale.y = SCALE_BIG;
      } else {
        wheel.scale.x = SCALE_SMALL;
        wheel.scale.y = SCALE_SMALL;
      }
      wheel.position.y = (wheel.scale.y * 0.4) - 0.005;
      wheel.position.z = -0.00001
      scene.add(wheel);
      wheels.push(wheel);
      return wheel;
    },
    rotateWheels: (distance) => {
      wheels.forEach(wheel => {
        wheel.rotateZ(-2 * distance / wheel.scale.x);
      });
    }
  };
};