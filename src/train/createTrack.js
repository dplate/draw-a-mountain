import {MIN_Z} from '../lib/constants.js';

const createGrass = (scene) => {
  const geometry = new THREE.PlaneBufferGeometry(1, 0.015);
  geometry.translate(0.5, -0.0075, MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0xc4d779, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-grass';
  scene.add(plane);
};

const createStation = (scene) => {
  const geometry = new THREE.PlaneBufferGeometry(0.15, 0.005);
  geometry.translate(0.7, -0.0025, MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0xe3e3e3, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-station';
  scene.add(plane);
};

const createStones = (scene) => {
  const geometry = new THREE.PlaneBufferGeometry(1, 0.005);
  geometry.translate(0.5, -0.0095, MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0xaead9e, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-stones';
  scene.add(plane);
};

const createSleepers = (scene) => {
  const geometry = new THREE.PlaneBufferGeometry(0.003, 0.004);
  const material = new THREE.MeshBasicMaterial({color: 0xbb7e15, side: THREE.DoubleSide});
  const averageDistance = 0.006;
  const count = Math.ceil(1 / averageDistance);
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  for (let i = 0; i < count; i++) {
    const matrix = new THREE.Matrix4();
    matrix.setPosition(
      i * averageDistance - 0.0005 + Math.random() * 0.001,
      -0.007 - Math.random() * 0.0005,
      MIN_Z
    );
    mesh.setMatrixAt(i, matrix);
  }
  mesh.name = 'track-sleepers';
  scene.add(mesh);
};

const createRails = (scene) => {
  const geometry = new THREE.PlaneBufferGeometry(1, 0.002);
  geometry.translate(0.5, -0.006, 2 * MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0x62625d, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-rails';
  scene.add(plane);
};

export default async (scene) => {
  await createGrass(scene);
  await createStation(scene);
  await createStones(scene);
  await createSleepers(scene);
  await createRails(scene);
};