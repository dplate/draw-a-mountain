import loadSvg from "../lib/loadSvg.js";

const loadMeshAndSetPivot = async (name, x, y) => {
  const meshGroup = await loadSvg(name);
  meshGroup.children.forEach((mesh) => {
    mesh.geometry.translate(x, y, 0);
  });
  return meshGroup;
}

const loadLeftArmMesh = (name) => loadMeshAndSetPivot(name, -0.2, 0.15);
const loadLeftLegMesh = (name) => loadMeshAndSetPivot(name, -0.1, 0.3);

export default async () => ({
  bodies: [
    {
      meshes: {
        left: await loadSvg('persons/bodies/left')
      }
    }
  ],
  heads: [
    {
      meshes: {
        left: await loadSvg('persons/heads/left')
      }
    }
  ],
  arms: [
    {
      meshes: {
        left: await loadLeftArmMesh('persons/arms/left')
      }
    }
  ],
  legs: [
    {
      meshes: {
        left: await loadLeftLegMesh('persons/legs/left')
      }
    }
  ]
});