import setCameraPosition from '../lib/setCameraPosition.js';
import {ZOOM_WIDTH} from '../lib/constants.js';
import addExit from './addExit.js';

const MAX_TAP_DISTANCE = 0.015;

const centerOffset = new THREE.Vector2();
const zoomCenterInstance = new THREE.Vector2();
const moveVector = new THREE.Vector2();

export default async ({scene, renderer, camera, audio, dispatcher}, persons) => {
  let zoomCenter = null;
  let person = null;
  const lastCenterOffset = new THREE.Vector2();

  const exit = await addExit(scene, renderer, camera);

  const zoomOut = () => {
    zoomCenter = null;
    person = null;
    setCameraPosition(camera, 1);
    audio.setZoomCenter(null);
    exit.show();
  };

  dispatcher.listen('observer', 'tap', ({point}) => {
    if (!exit.intersect(point)) {
      const tappedPerson = persons.findNearestPerson(point, MAX_TAP_DISTANCE);
      if (tappedPerson) {
        person = tappedPerson;
        if (!zoomCenter) {
          zoomCenter = zoomCenterInstance;
          zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, person.position));
          audio.setZoomCenter(zoomCenter);
          exit.hide();
        }
      } else {
        person = null;
        if (!zoomCenter) {
          zoomCenter = zoomCenterInstance;
          zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, point));
          audio.setZoomCenter(zoomCenter);
          exit.hide();
        } else {
          zoomOut()
        }
      }
    }
  });

  dispatcher.listen('observer', 'touchStart', ({point}) => {
    if (zoomCenter) {
      lastCenterOffset.subVectors(point, zoomCenter);
    } else {
      exit.start(point);
    }
  });

  dispatcher.listen('observer', 'touchEnd', () => {
    exit.abort();
  });

  dispatcher.listen('observer', 'touchMove', ({point}) => {
    person = null;
    if (zoomCenter) {
      centerOffset.subVectors(point, zoomCenter);
      zoomCenter.sub(centerOffset).add(lastCenterOffset);
      const newCenter = setCameraPosition(camera, ZOOM_WIDTH, null, zoomCenter);
      lastCenterOffset.addVectors(centerOffset, newCenter).sub(zoomCenter);
      zoomCenter.copy(newCenter);
      audio.setZoomCenter(zoomCenter);
    }
  });

  dispatcher.listen('observer', 'animate', ({elapsedTime}) => {
    if (person) {
      if (person.position.x < 0 || person.position.x > 1) {
        zoomOut();
      } else {
        moveVector.copy(person.position).sub(zoomCenter);
        const distance = moveVector.length();
        zoomCenter.add(moveVector.normalize().multiplyScalar(distance * elapsedTime * 0.0005));
        zoomCenter.copy(setCameraPosition(camera, ZOOM_WIDTH, null, zoomCenter));
        audio.setZoomCenter(zoomCenter);
      }
    }
    exit.progress(elapsedTime);
  });

  dispatcher.listen('observer', 'resize', () => {
    zoomOut()
    exit.updatePositions();
  });

  return new Promise(() => {
  });
};