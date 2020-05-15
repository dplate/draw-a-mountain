import loadSvg from "../lib/loadSvg.js";

const loadMeshAndSetPivot = async (name, mirror, x = 0, y = 0) => {
  const meshGroup = await loadSvg(name);
  meshGroup.children.forEach((mesh) => {
    mesh.geometry.translate(x, y, 0);
    if (mirror) {
      mesh.geometry.scale(-1, 1, 1);
    }
  });
  return meshGroup;
}

const loadArmMesh = (name, mirror) => loadMeshAndSetPivot(name, mirror, -0.2, 0.15);
const loadLegMesh = (name, mirror) => loadMeshAndSetPivot(name, mirror, -0.1, 0.3);

export default async () => ({
  bodies: [
    {
      left: await loadMeshAndSetPivot('persons/bodies/left', false),
      right: await loadMeshAndSetPivot('persons/bodies/left', true)
    }
  ],
  heads: [
    {
      left: await loadMeshAndSetPivot('persons/heads/left', false),
      right: await loadMeshAndSetPivot('persons/heads/left', true)
    }
  ],
  arms: [
    {
      left: await loadArmMesh('persons/arms/left', false),
      right: await loadArmMesh('persons/arms/left', true)
    }
  ],
  legs: [
    {
      left: await loadLegMesh('persons/legs/left', false),
      right: await loadLegMesh('persons/legs/left', true)
    }
  ]
});