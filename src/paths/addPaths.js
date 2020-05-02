import drawPaths from "./drawPaths.js";

const addPlaceholder = (scene, node) => {
  const geometry = new THREE.PlaneGeometry(0.003, 0.02);
  const material = new THREE.MeshBasicMaterial({color: 0x8f4c0b});
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = node.terrainInfo.point.x;
  mesh.position.y = node.terrainInfo.point.y;
  mesh.position.z = node.terrainInfo.point.z;
  scene.add(mesh);
};

export default async (scene, menu, terrain, restaurant, cableCar, dispatcher) => {
  const nodes = await drawPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  nodes.forEach(node => addPlaceholder(scene, node));
  return {};
};