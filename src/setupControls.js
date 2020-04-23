const transformCoordinates = (renderer, camera, clientX, clientY) => {
  const canvasSize = new THREE.Vector2();
  renderer.getSize(canvasSize);
  const cameraPoint = new THREE.Vector3(
    (clientX / canvasSize.x - 0.5) * 2,
    ((canvasSize.y - clientY)/canvasSize.y - 0.5) * 2,
    0
  );

  const worldPoint = cameraPoint.unproject(camera);
  worldPoint.x = Math.min(Math.max(worldPoint.x, 0), 1);
  worldPoint.y = Math.max(worldPoint.y, 0);
  return worldPoint;
};

export default (renderer, camera, dispatcher) => {
  new THREE.OrbitControls(camera, renderer.domElement);

  const buildControlEvent = (event) => ({
    point: transformCoordinates(renderer, camera, event.clientX, event.clientY)
  });

  let maybeATap = false;
  renderer.domElement.addEventListener('touchstart', (event) => {
    dispatcher.trigger('touchStart', buildControlEvent(event.targetTouches[0]));
    maybeATap = true;
  });
  renderer.domElement.addEventListener('touchmove', (event) => {
    dispatcher.trigger('touchMove', buildControlEvent(event.targetTouches[0]));
    maybeATap = false;
  });
  renderer.domElement.addEventListener('touchend', (event) => {
    dispatcher.trigger('touchEnd', buildControlEvent(event.changedTouches[0]));
    if (maybeATap) {
      dispatcher.trigger('tap', buildControlEvent(event.changedTouches[0]));
    }
    maybeATap = false;
  });
  renderer.domElement.addEventListener('touchcancel', (event) => {
    dispatcher.trigger('touchEnd', buildControlEvent(event.changedTouches[0]));
    maybeATap = false;
  });

  renderer.domElement.addEventListener('mousedown', (event) => {
    dispatcher.trigger('touchStart', buildControlEvent(event));
  });
  renderer.domElement.addEventListener('mousemove', (event) => {
    if (event.buttons === 1) {
      dispatcher.trigger('touchMove', buildControlEvent(event));
    }
  });
  renderer.domElement.addEventListener('mouseout', (event) => {
    if (event.buttons === 1) {
      dispatcher.trigger('touchEnd', buildControlEvent(event));
    }
  });
  renderer.domElement.addEventListener('mouseup', (event) => {
    dispatcher.trigger('touchEnd', buildControlEvent(event));
  });
  renderer.domElement.addEventListener('click', (event) => {
    dispatcher.trigger('tap', buildControlEvent(event));
  });
};