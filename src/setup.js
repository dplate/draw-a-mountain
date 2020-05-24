import setupControls from "./setupControls.js";
import createDispatcher from "./createDispatcher.js";

const recalculateCanvas = (renderer, camera, dispatcher, window) => {
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera.left = 0;
  camera.right = 1;
  camera.top = 1 / aspectRatio;
  camera.bottom = 0;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  dispatcher.trigger('resize', {});
};

let lastTime = 0;
const animate = (renderer, scene, camera, dispatcher, absoluteTime) => {
  const elapsedTime = absoluteTime - lastTime;
  if (elapsedTime < 1000) {
    dispatcher.trigger('animate', {elapsedTime: absoluteTime - lastTime});
  }
  lastTime = absoluteTime;
  renderer.render(scene, camera);
};

export default (window) => {
  const dispatcher = createDispatcher();

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0x027fbe));

  window.document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
  //const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); camera.position.set(0.5, 0.5, 1);
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0x404040)
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = -0.3;
  scene.add(directionalLight);

  window.addEventListener('resize', recalculateCanvas.bind(null, renderer, camera, dispatcher, window), false);
  recalculateCanvas(renderer, camera, dispatcher, window);

  setupControls(renderer, camera, dispatcher);

  renderer.setAnimationLoop(animate.bind(null, renderer, scene, camera, dispatcher));

  return {scene, camera, dispatcher};
}