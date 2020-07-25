import {MIN_Z} from '../lib/constants.js';
import createGradientPlane from '../lib/createGradientPlane.js';

const createGrass = () => {
  const plane = createGradientPlane(
    new THREE.Color(0x77930e),
    new THREE.Color(0xc2d678),
    0, 1, -0.015, 0, MIN_Z
  );
  plane.name = 'track-grass';
  return plane;
};

const createStation = () => {
  const plane = createGradientPlane(
    new THREE.Color(0xb0b0b0),
    new THREE.Color(0xe3e3e3),
    0.625, 0.775, -0.005, 0, MIN_Z
  );
  plane.name = 'track-station';
  return plane;
};

const createStones = () => {
  const plane = createGradientPlane(
    new THREE.Color(0x858478),
    new THREE.Color(0xaead9e),
    0, 1, -0.012, -0.007, MIN_Z
  );
  plane.name = 'track-stones';
  return plane;
};

const createSleepers = () => {
  const geometry = new THREE.PlaneBufferGeometry(0.003, 0.002);
  const material = new THREE.MeshBasicMaterial({color: 0xbb7e15, side: THREE.DoubleSide});
  const averageDistance = 0.006;
  const count = Math.ceil(1 / averageDistance);
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  for (let i = 0; i < count; i++) {
    const matrix = new THREE.Matrix4();
    matrix.setPosition(
      i * averageDistance - 0.0005 + Math.random() * 0.001,
      -0.0075 - Math.random() * 0.0002,
      3 * MIN_Z
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