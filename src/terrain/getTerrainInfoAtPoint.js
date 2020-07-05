const raycaster = new THREE.Raycaster(undefined, undefined, 0, 10);
const raycastOrigin = new THREE.Vector3();
const raycastVectorY = new THREE.Vector3(0, -1, 0);
const raycastVectorZ = new THREE.Vector3(0, 0, -1);
let geometry = null;

const intersectTerrain = (terrainMesh, point, vertical = false) => {
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
  return targets.length >= 1 ? targets[0] : null;
};

export const getTerrainPointAtPoint = (terrainMesh, point, vertical = false) => {
  const target = intersectTerrain(terrainMesh, point, vertical);
  return target ? target.point : null;
};

export default (terrainMesh, maxHeight, point, vertical = false) => {
  if (geometry === null) {
    geometry = new THREE.Geometry();
    geometry.fromBufferGeometry(terrainMesh.geometry);
  }
  const target = intersectTerrain(terrainMesh, point, vertical);
  if (target) {
    const normal = target.face.normal;
    const heightA = geometry.vertices[target.face.a].y;
    const heightB = geometry.vertices[target.face.b].y;
    const heightC = geometry.vertices[target.face.c].y;
    const slope = Math.max(Math.abs(heightA - heightB) + Math.abs(heightA - heightC) + Math.abs(heightB - heightC));
    return {
      point: target.point,
      normal,
      slope,
      height: target.point.y / maxHeight
    }
  }
  return null;
};