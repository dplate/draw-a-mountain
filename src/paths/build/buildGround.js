import selectRandom from "../../lib/selectRandom.js";

const direction = new THREE.Vector3();
const dirtPoint = new THREE.Vector3();
const upVector = new THREE.Vector3(0, 1, 0);
const position = new THREE.Vector3();

export default (grounds, fromTerrainInfo, toTerrainInfo) => {
  direction.subVectors(toTerrainInfo.point, fromTerrainInfo.point);
  const plane = new THREE.Plane(fromTerrainInfo.normal);
  const directionAngle = Math.PI / 2 - Math.atan(direction.z / direction.x);
  for (let i = 0; i < 20; i++) {
    const {item: ground} = selectRandom(grounds, fromTerrainInfo.height, fromTerrainInfo.slope);
    if (ground && Math.random() <= ground.density) {
      dirtPoint.x = 0.0025 * Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1);
      dirtPoint.y = 0;
      dirtPoint.z = (Math.random() - 0.5) * direction.length();
      dirtPoint.applyAxisAngle(upVector, directionAngle);
      plane.projectPoint(dirtPoint, position);
      position.add(fromTerrainInfo.point);
      position.addScaledVector(direction, 0.5);

      const matrix = new THREE.Matrix4();
      matrix.setPosition(position);
      ground.matrixes.push(matrix);
    }
  }
};