import loadSvg from "./loadSvg.js";

const CHUNK_SIZE = 50;

const matrix = new THREE.Matrix4();

export default async (scene, svgName) => {
  const meshGroup = await loadSvg(svgName);
  const instancedObject = {
    meshes: [],
    userData: {},
    count: 0,
    maxCount: CHUNK_SIZE,
  };

  meshGroup.children.forEach(mesh => {
    const instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, instancedObject.maxCount);
    instancedMesh.count = instancedObject.count;
    instancedObject.meshes.push(instancedMesh);
    scene.add(instancedMesh);
  });

  instancedObject.addInstance = () => {
    const instance = {
      userData: {},
      position: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
      index: instancedObject.count
    };

    if (instancedObject.count >= instancedObject.maxCount) {
      const newMaxCount = instancedObject.maxCount + CHUNK_SIZE;
      instancedObject.meshes = instancedObject.meshes.map(mesh => {
        const newMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, newMaxCount);
        newMesh.count = mesh.count;
        for (let i = 0; i < mesh.count; i++) {
          mesh.getMatrixAt(i, matrix);
          newMesh.setMatrixAt(i, matrix);
        }
        scene.remove(mesh);
        scene.add(newMesh);
        return newMesh;
      });
      instancedObject.maxCount = newMaxCount;
    }

    instancedObject.count++;
    instancedObject.meshes.forEach(mesh => mesh.count = instancedObject.count);

    instance.update = () => {
      matrix.compose(instance.position, instance.quaternion, instance.scale);
      instancedObject.meshes.forEach(mesh => {
        mesh.setMatrixAt(instance.index, matrix);
        mesh.instanceMatrix.needsUpdate = true;
      });
    };

    return instance;
  };

  return instancedObject;
}