import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';
import {MIN_Z} from '../lib/constants.js';

const SCALE_BIG = 0.01;
const SCALE_SMALL = 0.005;

const zVector = new THREE.Vector3(0, 0, 1);

export default async (scene) => {
  const wheels = [];
  const instancedObject = await createInstancedObjectFromSvg(scene, 'train/wheel');
  instancedObject.mesh.geometry.translate(0, 0.5, 0);

  return {
    add: (big) => {
      const wheel = instancedObject.addInstance();
      if (big) {
        wheel.scale.x = SCALE_BIG;
        wheel.scale.y = SCALE_BIG;
      } else {
        wheel.scale.x = SCALE_SMALL;
        wheel.scale.y = SCALE_SMALL;
      }
      wheel.position.x -= 1;
      wheel.position.y = (wheel.scale.y * 0.4) - 0.005;
      wheel.position.z = 0.1 + MIN_Z;
      wheel.userData.rotation = 0;
      wheels.push(wheel);
      return wheel;
    },
    rotateWheels: (distance) => {
      wheels.forEach(wheel => {
        wheel.userData.rotation -= 2 * distance / wheel.scale.x;
        wheel.quaternion.setFromAxisAngle(zVector, wheel.userData.rotation);
        wheel.update()
      });
    }
  };
};