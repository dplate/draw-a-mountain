import setCameraPosition from '../lib/setCameraPosition.js';

const ZOOM_WIDTH = 0.35;
const MAX_TAP_DISTANCE = 0.015;

const centerOffset = new THREE.Vector2();
const zoomCenterInstance = new THREE.Vector2();
const moveVector = new THREE.Vector2();

export default async ({camera, dispatcher}, persons) => {
  let zoomCenter = null;
  let person = null;
  const lastCenterOffset = new THREE.Vector2();

  dispatcher.listen('observer', 'tap', ({point}) => {
    const tappedPerson = persons.findNearestPerson(point, MAX_TAP_DISTANCE);
    if (tappedPerson) {
      person = tappedPerson;
      if (!zoomCenter) {
        zoomCenter = zoomCenterInstance;
        zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, person.position));
      }
    } else {
      person = null;
      if (!zoomCenter) {
        zoomCenter = zoomCenterInstance;
        zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, point));
      } else {
        zoomCenter = null;
        person = null;
        setCameraPosition(camera, 1);
      }
    }
  });

  dispatcher.listen('observer', 'touchStart', ({point}) => {
    if (zoomCenter) {
      lastCenterOffset.subVectors(point, zoomCenter);
    }
  });

  dispatcher.listen('observer', 'touchMove', ({point}) => {
    person = null;
    if (zoomCenter) {
      centerOffset.subVectors(point, zoomCenter);
      zoomCenter.sub(centerOffset).add(lastCenterOffset);
      const newCenter = setCameraPosition(camera, ZOOM_WIDTH, null, zoomCenter);
      lastCenterOffset.addVectors(centerOffset, newCenter).sub(zoomCenter);
      zoomCenter.copy(newCenter);
    }
  });

  dispatcher.listen('observer', 'animate', ({elapsedTime}) => {
    if (person) {
      if (person.position.x < 0 || person.position.x > 1) {
        person = null;
        zoomCenter = null;
        setCameraPosition(camera, 1);
      } else {
        moveVector.copy(person.position).sub(zoomCenter);
        const distance = moveVector.length();
        zoomCenter.add(moveVector.normalize().multiplyScalar(distance * elapsedTime * 0.0005));
        zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, zoomCenter));
      }
    }
  });

  return new Promise(() => {
  });
};