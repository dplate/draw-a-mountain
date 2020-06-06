import {MIN_Z} from '../../lib/constants.js';

export default (scene, nodes, terrainInfo, entrances = []) => {
  const geometry = new THREE.CircleBufferGeometry(0.01, 16);
  const material = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.5});
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = terrainInfo.point.x;
  mesh.position.y = terrainInfo.point.y;
  mesh.position.z = 4 * MIN_Z;
  scene.add(mesh);

  const geometryPoint = new THREE.CircleBufferGeometry(0.005, 16);
  const materialPoint = new THREE.MeshBasicMaterial({color: 0x000000});
  const pointMesh = new THREE.Mesh(geometryPoint, materialPoint);
  pointMesh.position.x = terrainInfo.point.x;
  pointMesh.position.y = terrainInfo.point.y;
  pointMesh.position.z = 8 * MIN_Z;
  scene.add(pointMesh);

  const node = {
    mesh,
    pointMesh,
    terrainInfo,
    entrances,
    paths: []
  }
  nodes.push(node);

  return node;
};