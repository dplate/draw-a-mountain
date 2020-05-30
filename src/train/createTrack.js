const createGrass = (scene) => {
  const geometry = new THREE.PlaneGeometry(1, 0.003);
  geometry.translate(0.5, -0.0085, -0.0001);
  const material = new THREE.MeshBasicMaterial({color: 0xc4d779, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
};

const createStones = (scene) => {
  const geometry = new THREE.PlaneGeometry(1, 0.005);
  geometry.translate(0.5, -0.0045, -0.0001);
  const material = new THREE.MeshBasicMaterial({color: 0xaead9e, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
};

const createSleepers = (scene) => {
  const geometry = new THREE.PlaneGeometry(0.003, 0.004);
  const material = new THREE.MeshBasicMaterial({color: 0xbb7e15, side: THREE.DoubleSide});
  for (let i = 0; i < 200; i++) {
    const plane = new THREE.Mesh(geometry, material);
    plane.position.x = i * 0.006 - 0.0005 + Math.random() * 0.001;
    plane.position.y = -0.002 - Math.random() * 0.0005;
    plane.position.z = -0.0001;
    scene.add(plane);
  }
};

const createRails = (scene) => {
  const geometry = new THREE.PlaneGeometry(1, 0.002);
  geometry.translate(0.5, -0.001, -0.00005);
  const material = new THREE.MeshBasicMaterial({color: 0x62625d, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
};

export default async (scene) => {
  await createGrass(scene);
  await createStones(scene);
  await createSleepers(scene);
  await createRails(scene);
};