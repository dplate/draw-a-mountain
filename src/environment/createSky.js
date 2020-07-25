import createGradientPlane from '../lib/createGradientPlane.js';

export default (scene) => {
  const mistColor = new THREE.Color(0xb4daf1);
  const skyColor = new THREE.Color(0x027fbe);

  const mesh = createGradientPlane(
    mistColor,
    skyColor,
    0, 1, -0.015, 1, -9
  );
  mesh.name = 'sky';

  scene.add(mesh);
};