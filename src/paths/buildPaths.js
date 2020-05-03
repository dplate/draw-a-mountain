const buildGround = (scene, ground, terrainInfo, direction) => {
  const maxJitter = 0.005;
  const jitterOffset = new THREE.Vector3();
  const plane = new THREE.Plane(terrainInfo.normal);
  const direction2 = new THREE.Vector2(direction.x, direction.y);
  direction2.normalize();
  const maxConcentrationX = 1 + Math.atan(Math.abs(direction2.y));
  const maxConcentrationZ = 1 + Math.atan(Math.abs(direction2.x));
  for (let i = 0; i < 50; i++) {
    const mesh = ground.clone();
    jitterOffset.x = maxJitter * Math.pow(Math.random(), maxConcentrationX) * (Math.random() < 0.5 ? -1 : 1);
    jitterOffset.y = 0;
    jitterOffset.z = maxJitter * Math.pow(Math.random(), maxConcentrationZ) * (Math.random() < 0.5 ? -1 : 1);
    plane.projectPoint(jitterOffset, mesh.position);
    mesh.position.add(terrainInfo.point);
    mesh.position.y += Math.random() * 0.005;
    scene.add(mesh);
  }
}

const buildPath = (scene, terrain, meshes, path) => {
  if (path.built) {
    return;
  }

  const center = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const [startPoint, endPoint] = path.nodes.map(node => node.terrainInfo.point);
  const line = new THREE.Line3(startPoint, endPoint);
  line.delta(direction);
  direction.normalize();
  const opticalDistance = Math.sqrt(
    (line.end.x - line.start.x) * (line.end.x - line.start.x) +
    (line.end.y - line.start.y) * (line.end.y - line.start.y)
  );
  path.steps = [];
  for (let factor = 0; factor <= 1; factor += 0.005 / opticalDistance) {
    line.at(factor, center);
    const terrainInfo = terrain.getTerrainInfoAtPoint(center, true);
    buildGround(scene, meshes.ground, terrainInfo, direction);

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
  const geometry = new THREE.CircleGeometry(0.001, 5);
  const material = new THREE.MeshBasicMaterial({color: 0x8f4c0b, transparent: true, opacity: 0.3});
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