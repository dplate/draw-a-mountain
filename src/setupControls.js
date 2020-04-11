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

const buildControlEvent = (renderer, camera, event) => ({
  point: transformCoordinates(renderer, camera, event.clientX, event.clientY)
});

export default (renderer, camera, dispatcher) => {
  new THREE.OrbitControls(camera, renderer.domElement);

  renderer.domElement.onmousedown = (event) => {
    dispatcher.trigger('touchStart', buildControlEvent(renderer, camera, event));
  };
  renderer.domElement.onmousemove = (event) => {
    if (event.buttons === 1) {
      dispatcher.trigger('touchMove', buildControlEvent(renderer, camera, event));
    }
  };
  renderer.domElement.onmouseup = (event) => {
    dispatcher.trigger('touchEnd', buildControlEvent(renderer, camera, event));
  };
};