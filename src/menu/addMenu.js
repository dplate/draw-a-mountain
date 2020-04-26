import loadSvg from "../lib/loadSvg.js";
import setOpacity from "../lib/setOpacity.js";

const updatePosition = (camera, nextMesh) => {
  const cameraPoint = new THREE.Vector3(1, 1, 0);
  const worldPoint = cameraPoint.unproject(camera);
  const scale = 0.05;
  nextMesh.scale.x = scale;
  nextMesh.scale.y = scale;
  nextMesh.position.x = worldPoint.x - scale / 2 - 0.01;
  nextMesh.position.y = worldPoint.y - 0.01;
  nextMesh.position.z = 0;
}

const isOnNext = (nextMesh, point) => {
  return point.x >= nextMesh.position.x - nextMesh.scale.x / 2 && point.x <= nextMesh.position.x + nextMesh.scale.x / 2 &&
    point.y >= nextMesh.position.y - nextMesh.scale.y && point.y <= nextMesh.position.y;
}

export default async (scene, camera, dispatcher) => {
  const nextMesh = await loadSvg('menu/next');
  nextMesh.visible = false;
  setOpacity([nextMesh], 0.7);
  updatePosition(camera, nextMesh);
  scene.add(nextMesh);

  dispatcher.listen('menu', 'resize', updatePosition.bind(null, camera, nextMesh));

  return {
    isOnMenu: (point) => {
      return isOnNext(nextMesh, point);
    },
    waitForNext: () => {
      return new Promise((resolve) => {
        nextMesh.visible = true;
        dispatcher.listen('menu', 'tap', ({point}) => {
          setOpacity([nextMesh], 0.2);
          if (isOnNext(nextMesh, point)) {
            nextMesh.visible = false;
            dispatcher.stopListen('menu', 'tap');
            resolve();
          }
        });
      });
    }
  };
};