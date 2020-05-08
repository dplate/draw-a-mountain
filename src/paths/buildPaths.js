const upVector = new THREE.Vector3(0, 1, 0);

const buildGround = (scene, ground, fromTerrainInfo, toTerrainInfo) => {
  const direction = new THREE.Vector3();
  direction.subVectors(toTerrainInfo.point, fromTerrainInfo.point);
  const plane = new THREE.Plane(fromTerrainInfo.normal);
  const dirtPoint = new THREE.Vector3();
  const directionAngle = Math.PI / 2 - Math.atan(direction.z / direction.x);
  for (let i = 0; i < 20; i++) {
    dirtPoint.x = 0.0025 * Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1);
    dirtPoint.y = 0;
    dirtPoint.z = (Math.random() - 0.5) * direction.length();
    dirtPoint.applyAxisAngle(upVector, directionAngle);

    const mesh = ground.clone();
    plane.projectPoint(dirtPoint, mesh.position);
    mesh.position.add(fromTerrainInfo.point);
    mesh.position.addScaledVector(direction, 0.5);
    scene.add(mesh);
  }
}

const buildPath = (scene, terrain, meshes, path) => {
  if (path.built) {
    return;
  }

  const [startPoint, endPoint] = path.nodes.map(node => node.terrainInfo.point);
  const line = new THREE.Line3(startPoint, endPoint);
  const opticalDistance = Math.sqrt(
    (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x) +
    (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y)
  );
  const center = new THREE.Vector3();

  path.steps = [path.nodes[0].terrainInfo];
  const factorStep = 0.005 / opticalDistance;
  for (let factor = factorStep; factor <= 1; factor += factorStep) {
    line.at(factor, center);
    const terrainInfo = terrain.getTerrainInfoAtPoint(center, true);
    buildGround(scene, meshes.ground, path.steps[path.steps.length - 1], terrainInfo);

    path.steps.push(terrainInfo);
  }

  path.built = true;
};

const buildPlaceholders = (scene, placeholder, node) => {
  const mesh = placeholder.clone();
  mesh.position.x = node.terrainInfo.point.x;
  mesh.position.y = node.terrainInfo.point.y;
  mesh.position.z = node.terrainInfo.point.z;
  scene.add(mesh);
};

const loadPlaceholder = () => {
  const geometry = new THREE.PlaneGeometry(0.001, 0.02);
  const material = new THREE.MeshBasicMaterial({color: 0x8f4c0b});
  return new THREE.Mesh(geometry, material);
};

const loadGround = () => {
  const geometry = new THREE.CircleGeometry(0.002, 5);
  const material = new THREE.MeshBasicMaterial({color: 0x8f4c0b, transparent: true, opacity: 0.1});
  return new THREE.Mesh(geometry, material);
};

export default async (scene, terrain, nodes) => {
  const meshes = {
    placeholder: loadPlaceholder(),
    ground: loadGround()
  };

  nodes.forEach(node => buildPlaceholders(scene, meshes.placeholder, node));

  nodes.forEach(node => {
    node.paths.forEach(path => {
      buildPath(scene, terrain, meshes, path);
    });
  });
  return {};
};