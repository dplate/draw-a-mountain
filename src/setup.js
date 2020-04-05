import setupScene from "./setupScene.js";
import setupControls from "./setupControls.js";

const recalculateCanvas = (renderer, camera, window) => {
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera.left = 0;
  camera.right = 1;
  camera.top = 1 / aspectRatio;
  camera.bottom = 0;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth , window.innerHeight);
};

const animate = (renderer, scene, camera) => {
  renderer.render(scene, camera);
};

export default (window, callbacks) => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0x027fbe));

  window.document.body.appendChild(renderer.domElement);

  const scene = setupScene();

  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 0);
  //const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); camera.position.set(0.5, 0.5, 1);
  scene.add(camera);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = -0.3;
  scene.add(directionalLight);

  window.addEventListener('resize', recalculateCanvas.bind(null, renderer, camera, window), false);
  recalculateCanvas(renderer, camera, window);

  setupControls(renderer, camera, callbacks);

  renderer.setAnimationLoop(animate.bind(null, renderer, scene, camera));

  return { scene };
}