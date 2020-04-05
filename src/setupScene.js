import setupEnvironment from "./environment/setupEnvironment.js";

export default () => {
  const scene = new THREE.Scene();
  setupEnvironment(scene);
  return scene;
}