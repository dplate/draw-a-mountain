import {MIN_Z} from '../lib/constants.js';

const createGrass = () => {
  const geometry = new THREE.PlaneBufferGeometry(1, 0.015);
  geometry.translate(0.5, -0.0075, MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0xc2d678, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-grass';
  return plane;
};

const createStation = () => {
  const geometry = new THREE.PlaneBufferGeometry(0.15, 0.005);
  geometry.translate(0.7, -0.0025, MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0xe3e3e3, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-station';
  return plane;
};

const createStones = () => {
  const geometry = new THREE.PlaneBufferGeometry(1, 0.005);
  geometry.translate(0.5, -0.0095, MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0xaead9e, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-stones';
  return plane;
};

const createSleepers = () => {
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
  return mesh;
};

const createRails = () => {
  const geometry = new THREE.PlaneBufferGeometry(1, 0.002);
  geometry.translate(0.5, -0.006, 2 * MIN_Z);
  const material = new THREE.MeshBasicMaterial({color: 0x62625d, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.name = 'track-rails';
  return plane;
};

export default async (scene, audio, dispatcher) => {
  const track = new THREE.Object3D();
  track.add(await createGrass());
  track.add(await createStation());
  track.add(await createStones());
  track.add(await createSleepers());
  track.add(await createRails());
  track.position.y = -0.015;
  scene.add(track);

  const cricket = await audio.load('train/cricket');
  cricket.play();

  await new Promise(resolve => {
    dispatcher.listen('track', 'animate', ({elapsedTime}) => {
      track.position.y += elapsedTime * 0.000005;
      if (track.position.y > 0) {
        track.position.y = 0;
        dispatcher.stopListen('track', 'animate');
        resolve();
      }
    });
  })
};