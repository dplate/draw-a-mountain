import loadSvg from "./loadSvg.js";

const CHUNK_SIZE = 50;

const matrix = new THREE.Matrix4();

export default async (scene, svgName) => {
  const mesh = await loadSvg(svgName);
  const instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, CHUNK_SIZE);
  instancedMesh.count = 0;
  instancedMesh.name = svgName;
  scene.add(instancedMesh);

  const instancedObject = {
    mesh: instancedMesh,
    userData: {},
    maxCount: CHUNK_SIZE,
  };

  instancedObject.addInstance = () => {
    const instance = {
      userData: {},
      position: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
      index: instancedObject.mesh.count
    };

    if (instancedObject.mesh.count >= instancedObject.maxCount) {
      const newMaxCount = instancedObject.maxCount + CHUNK_SIZE;
      const newMesh = new THREE.InstancedMesh(instancedObject.mesh.geometry, instancedObject.mesh.material, newMaxCount);
      newMesh.count = instancedObject.mesh.count;
      newMesh.userData = {
        ...instancedObject.mesh.userData
      };
      newMesh.name = instancedObject.mesh.name;
      for (let i = 0; i < instancedObject.mesh.count; i++) {
        instancedObject.mesh.getMatrixAt(i, matrix);
        newMesh.setMatrixAt(i, matrix);
      }
      scene.remove(instancedObject.mesh);
      scene.add(newMesh);

      instancedObject.mesh = newMesh;
      instancedObject.maxCount = newMaxCount;
    }

    instancedObject.mesh.count++;

    instance.update = () => {
      matrix.compose(instance.position, instance.quaternion, instance.scale);
      instancedObject.mesh.setMatrixAt(instance.index, matrix);
      instancedObject.mesh.instanceMatrix.needsUpdate = true;
    };

    return instance;
  };

  return instancedObject;
}