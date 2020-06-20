import setCameraPosition from '../lib/setCameraPosition.js';

const ZOOM_WIDTH = 0.3;
const centerOffset = new THREE.Vector2();
const zoomCenterInstance = new THREE.Vector2();

export default async ({camera, dispatcher}) => {
  let zoomCenter = null;
  const lastCenterOffset = new THREE.Vector2();

  dispatcher.listen('observer', 'tap', ({point}) => {
    if (!zoomCenter) {
      zoomCenter = zoomCenterInstance;
      zoomCenter.copy(point);
      zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, zoomCenter));
      lastCenterOffset.subVectors(point, zoomCenter)
    } else {
      zoomCenter = null;
      setCameraPosition(camera, 1);
    }
  });

  dispatcher.listen('observer', 'touchStart', ({point}) => {
    if (zoomCenter) {
      lastCenterOffset.subVectors(point, zoomCenter);
    }
  });

  dispatcher.listen('observer', 'touchMove', ({point}) => {
    if (zoomCenter) {
      centerOffset.subVectors(point, zoomCenter);
      zoomCenter.sub(centerOffset).add(lastCenterOffset);
      const newCenter = setCameraPosition(camera, ZOOM_WIDTH, null, zoomCenter);
      lastCenterOffset.addVectors(centerOffset, newCenter).sub(zoomCenter);
      zoomCenter.copy(newCenter);
    }
  });

  return new Promise(() => {
  });
};