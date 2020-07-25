import setupControls from './setupControls.js';
import createDispatcher from './setupDispatcher.js';
import setCameraPosition from './lib/setCameraPosition.js';

const recalculateCanvas = (renderer, camera, dispatcher, window) => {
  const aspectRatio = window.innerWidth / window.innerHeight;
  setCameraPosition(camera, 1, aspectRatio)

  renderer.setSize(window.innerWidth, window.innerHeight);

  dispatcher.trigger('resize', {});
};

let lastTime = 0;
let pauseTimer = null;
const animate = (renderer, scene, camera, dispatcher, absoluteTime) => {
  const elapsedTime = absoluteTime - lastTime;
  if (elapsedTime < 1000) {
    dispatcher.trigger('animate', {elapsedTime: absoluteTime - lastTime});
  } else if (!pauseTimer) {
    dispatcher.trigger('resume');
  }
  clearTimeout(pauseTimer);
  pauseTimer = window.setTimeout(() => {
    dispatcher.trigger('pause');
    pauseTimer = null;
  }, 1000);

  lastTime = absoluteTime;
  renderer.render(scene, camera);
};

export default (window) => {
  const dispatcher = createDispatcher();

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0x000000));

  window.document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 12);
  camera.position.z = 2;
  camera.name = 'camera';
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0x404040);
  ambient.name = 'light-ambient';
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = -0.3;
  directionalLight.name = 'light-directional';
  scene.add(directionalLight);

  window.addEventListener('resize', recalculateCanvas.bind(null, renderer, camera, dispatcher, window), false);
  recalculateCanvas(renderer, camera, dispatcher, window);

  setupControls(renderer, camera, dispatcher);

  renderer.setAnimationLoop(animate.bind(null, renderer, scene, camera, dispatcher));

  return {scene, renderer, camera, audio: null, dispatcher};
}