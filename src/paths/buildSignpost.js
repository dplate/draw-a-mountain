const POST_HEIGHT = 0.025;
const SIGN_HEIGHT = 0.0025;
const SIGN_GAP = 0.0005;

const postMaterial = new THREE.MeshBasicMaterial({color: 0x777777})
const postGeometry = new THREE.PlaneGeometry(0.0012, POST_HEIGHT);

const signMaterials = [
  new THREE.MeshBasicMaterial({color: 0xbe7b10, side: THREE.DoubleSide}),
  new THREE.MeshBasicMaterial({color: 0xb8221e, side: THREE.DoubleSide}),
  new THREE.MeshBasicMaterial({color: 0x01174d, side: THREE.DoubleSide})
];
const signGeometry = new THREE.PlaneGeometry(0.005, SIGN_HEIGHT, 1, 2);
signGeometry.vertices[3].x += 0.002;

const poiMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc})
const poiGeometry = new THREE.PlaneGeometry(0.002, 0.002);

const rightVector = new THREE.Vector3(1, 0, 0);

const buildSign = (scene, path, postPosition, angle, index) => {
  const sign = new THREE.Mesh(signGeometry, signMaterials[path.routeDifficulty]);
  sign.rotateY(angle);
  sign.position.copy(postPosition);
  sign.position.y += POST_HEIGHT / 2 - (SIGN_HEIGHT + SIGN_GAP) * (index + 1);
  sign.position.z += 0.001;
  scene.add(sign);
};

export default (scene, node) => {
  if (node.paths.length === 2) {
    return;
  }

  const post = new THREE.Mesh(postGeometry, postMaterial);
  post.position.copy(node.terrainInfo.point);
  post.position.y += POST_HEIGHT / 2 - 0.01;
  post.position.z += 0.05;
  scene.add(post);

  node.paths.forEach((path, index) => {
    const targetNode = path.nodes.find(n => n !== node);
    const direction = new THREE.Vector3();
    direction.subVectors(targetNode.terrainInfo.point, node.terrainInfo.point);
    direction.z = 0;
    const angle = direction.angleTo(rightVector);
    buildSign(scene, path, post.position, angle, index);
  });

  const poi = new THREE.Mesh(poiGeometry, poiMaterial);
  poi.position.copy(post.position);
  poi.position.y += POST_HEIGHT / 2 - (SIGN_HEIGHT + SIGN_GAP) * (node.paths.length + 1);
  poi.position.z += 0.001;
  scene.add(poi);
};