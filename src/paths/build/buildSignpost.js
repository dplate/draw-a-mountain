import {POST_HEIGHT, POST_WIDTH, SIGN_HEIGHT} from "./signpostSizes.js";

const SIGN_GAP = 0.0005;
const rightVector = new THREE.Vector3(1, 0, 0);
const position = new THREE.Vector3();
const direction = new THREE.Vector3();

const buildPost = (post, nodePosition) => {
  position.copy(nodePosition);
  position.y += POST_HEIGHT / 2 - 0.01;
  position.z = Math.min(position.z + 0.05, -0.0001);
  const matrix = new THREE.Matrix4();
  matrix.setPosition(position);
  post.matrixes.push(matrix);
  return position.clone();
};

const buildSign = (sign, postPosition, angle, index) => {
  position.copy(postPosition);
  position.x += POST_WIDTH / 2 * ((angle > Math.PI / 2) ? -1 : 1);
  position.y += POST_HEIGHT / 2 - (SIGN_HEIGHT + SIGN_GAP) * (index + 1);
  position.z += 0.0001;
  const matrix = new THREE.Matrix4();
  matrix.setPosition(position);
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationY(angle);
  matrix.multiply(rotationMatrix);
  sign.matrixes.push(matrix);
};

const buildPoi = (poi, paths, postPosition) => {
  position.copy(postPosition);
  position.y += POST_HEIGHT / 2 - (SIGN_HEIGHT + SIGN_GAP) * (paths.length + 1);
  position.z += 0.0002;
  const matrix = new THREE.Matrix4();
  matrix.setPosition(position);
  poi.matrixes.push(matrix);
};

export default (signpostParts, node) => {
  if (node.paths.length === 2 && node.entrances.length === 0) {
    return;
  }

  const postPosition = buildPost(signpostParts.post, node.terrainInfo.point);

  node.paths.forEach((path, index) => {
    const targetNode = path.nodes.find(n => n !== node);
    direction.subVectors(targetNode.terrainInfo.point, node.terrainInfo.point);
    direction.z = 0;
    const angle = direction.angleTo(rightVector);
    buildSign(signpostParts['sign_' + path.routeDifficulty], postPosition, angle, index);
  });

  buildPoi(signpostParts.poi, node.paths, postPosition);
};