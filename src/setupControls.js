const transformCoordinates = (renderer, camera, clientX, clientY) => {
  const canvasSize = new THREE.Vector2();
  renderer.getSize(canvasSize);
  const cameraPoint = new THREE.Vector3(
    (clientX / canvasSize.x - 0.5) * 2,
    ((canvasSize.y - clientY) / canvasSize.y - 0.5) * 2,
    0
  );

  const worldPoint = cameraPoint.unproject(camera);
  worldPoint.x = Math.min(Math.max(worldPoint.x, 0), 1);
  worldPoint.y = Math.max(worldPoint.y, 0);
  worldPoint.z = 0;
  return worldPoint;
};

const hasTapMovedTooMuch = (tapStartEvent, currentEvent) => {
  return (
    Math.abs(tapStartEvent.clientX - currentEvent.clientX) > 5 ||
    Math.abs(tapStartEvent.clientY - currentEvent.clientY) > 5
  );
};

export default (renderer, camera, dispatcher) => {
  const buildControlEvent = (event) => ({
    point: transformCoordinates(renderer, camera, event.clientX, event.clientY)
  });

  let maybeATap = null;
  let touchActive = null;
  renderer.domElement.addEventListener('touchstart', (event) => {
    const touch = event.targetTouches[0];
    dispatcher.trigger('touchStart', buildControlEvent(touch));
    maybeATap = touch;
    touchActive = touch;
  });
  renderer.domElement.addEventListener('touchmove', (event) => {
    const touch = event.targetTouches[0];
    if (!maybeATap) {
      dispatcher.trigger('touchMove', buildControlEvent(touch));
    } else if (hasTapMovedTooMuch(maybeATap, touch)) {
      maybeATap = null;
    }
    touchActive = touch;
    event.preventDefault();
  });
  renderer.domElement.addEventListener('touchend', (event) => {
    if (touchActive) {
      touchActive = null;
      dispatcher.trigger('touchEnd', buildControlEvent(event.changedTouches[0]));
    }
    if (maybeATap) {
      maybeATap = null;
      dispatcher.trigger('tap', buildControlEvent(event.changedTouches[0]));
    }
    event.preventDefault();
  });
  renderer.domElement.addEventListener('touchcancel', (event) => {
    if (touchActive) {
      touchActive = null;
      dispatcher.trigger('touchEnd', buildControlEvent(event.changedTouches[0]));
    }
    maybeATap = null;
    event.preventDefault();
  });

  renderer.domElement.addEventListener('mousedown', (event) => {
    dispatcher.trigger('touchStart', buildControlEvent(event));
    maybeATap = event;
    touchActive = event;
  });
  renderer.domElement.addEventListener('mousemove', (event) => {
    if (event.buttons === 1) {
      if (!maybeATap) {
        dispatcher.trigger('touchMove', buildControlEvent(event));
      } else if (hasTapMovedTooMuch(maybeATap, event)) {
        maybeATap = null;
      }
      touchActive = event;
    }
  });
  renderer.domElement.addEventListener('mouseout', (event) => {
    if (event.buttons === 1) {
      if (touchActive) {
        touchActive = null;
        dispatcher.trigger('touchEnd', buildControlEvent(event));
      }
      maybeATap = null;
    }
  });
  renderer.domElement.addEventListener('mouseup', (event) => {
    if (touchActive) {
      touchActive = null;
      dispatcher.trigger('touchEnd', buildControlEvent(event));
    }
    if (maybeATap) {
      maybeATap = null;
      dispatcher.trigger('tap', buildControlEvent(event));
    }
  });
};