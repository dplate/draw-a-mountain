import selectRandom from "../../lib/selectRandom.js";

const upVector = new THREE.Vector3(0, 1, 0);

export default (scene, grounds, fromTerrainInfo, toTerrainInfo) => {
  const direction = new THREE.Vector3();
  direction.subVectors(toTerrainInfo.point, fromTerrainInfo.point);
  const plane = new THREE.Plane(fromTerrainInfo.normal);
  const dirtPoint = new THREE.Vector3();
  const directionAngle = Math.PI / 2 - Math.atan(direction.z / direction.x);
  for (let i = 0; i < 20; i++) {
    const {item: ground} = selectRandom(grounds, fromTerrainInfo.height, fromTerrainInfo.slope);
    if (ground && Math.random() <= ground.density) {
      const mesh = ground.mesh.clone();

      dirtPoint.x = 0.0025 * Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1);
      dirtPoint.y = 0;
      dirtPoint.z = (Math.random() - 0.5) * direction.length();
      dirtPoint.applyAxisAngle(upVector, directionAngle);
      plane.projectPoint(dirtPoint, mesh.position);
      mesh.position.add(fromTerrainInfo.point);
      mesh.position.addScaledVector(direction, 0.5);

      scene.add(mesh);
    }
  }
};