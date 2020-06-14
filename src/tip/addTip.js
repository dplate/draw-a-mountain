import loadSvg from '../lib/loadSvg.js';

const zVector = new THREE.Vector3(0, 0, 1);

const getInactivityTime = (showCount) => {
  switch (showCount) {
    case 0:
      return 3000;
    case 1:
      return 5000;
    default:
      return 10000;
  }
};

const resetInactivityTime = (tip) => {
  tip.finger.visible = false;
  tip.inactivityTimeLeft = getInactivityTime(tip.showCount);
};

const updatePosition = (tip) => {
  const factor = (tip.duration - tip.durationTimeLeft) / tip.duration;
  const alpha = (1 - Math.cos(factor * Math.PI)) / 2;
  const point = tip.path.getPoint(alpha);
  tip.finger.position.x = point.x;
  tip.finger.position.y = point.y + 0.04;
  tip.finger.position.z = 0.3;
  tip.finger.setRotationFromAxisAngle(zVector, 0.25 + (1 - point.x) * 0.5);
}

const loadFinger = async (scene) => {
  const finger = await loadSvg('tip/finger');
  finger.visible = false;
  finger.scale.x = 0.07;
  finger.scale.y = 0.07;
  scene.add(finger);
  return finger;
}

export default async ({scene, dispatcher}) => {
  const tip = {
    finger: await loadFinger(scene),
    path: null,
    duration: 0,
    durationTimeLeft: 0,
    showCount: 0,
    inactivityTimeLeft: 0
  };

  dispatcher.listen('tip', 'animate', ({elapsedTime}) => {
    if (tip.path !== null) {
      if (tip.inactivityTimeLeft < 0) {
        tip.durationTimeLeft -= elapsedTime;
        if (tip.durationTimeLeft < 0) {
          resetInactivityTime(tip);
        } else {
          updatePosition(tip);
        }
      } else {
        tip.inactivityTimeLeft -= elapsedTime;
        if (tip.inactivityTimeLeft < 0) {
          tip.durationTimeLeft = tip.duration;
          updatePosition(tip);
          tip.finger.visible = true;
          tip.showCount++;
        }
      }
    }
  });

  dispatcher.listen('tip', 'touchStart', resetInactivityTime.bind(null, tip));
  dispatcher.listen('tip', 'touchMove', resetInactivityTime.bind(null, tip));
  dispatcher.listen('tip', 'touchEnd', resetInactivityTime.bind(null, tip));

  return {
    setTip: (path, duration = 0) => {
      tip.path = path;
      tip.duration = duration;
      tip.showCount = 0;
      tip.inactivityTimeLeft = getInactivityTime(tip.showCount)
    }
  };
};