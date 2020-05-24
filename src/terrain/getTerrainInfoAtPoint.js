const raycaster = new THREE.Raycaster(undefined, undefined, 0, 10);
const raycastOrigin = new THREE.Vector3();
const raycastVectorY = new THREE.Vector3(0, -1, 0);
const raycastVectorZ = new THREE.Vector3(0, 0, -1);

export default (terrainMesh, maxHeight, point, vertical = false) => {
  if (vertical) {
    raycastOrigin.copy(point);
    raycastOrigin.y = 10;
    raycaster.set(raycastOrigin, raycastVectorY);
  } else {
    raycastOrigin.copy(point);
    raycastOrigin.z = 0;
    raycaster.set(raycastOrigin, raycastVectorZ);
  }
  const targets = raycaster.intersectObject(terrainMesh);
  if (targets.length >= 1) {
    const target = targets[0];
    const normal = target.face.normal;
    const slope = (Math.PI - 2 * Math.atan(normal.y / Math.sqrt(normal.x * normal.x + normal.z * normal.z))) / Math.PI;
    return {
      point: target.point,
      normal,
      slope,
      height: target.point.y / maxHeight
    }
  }
  return null;
};