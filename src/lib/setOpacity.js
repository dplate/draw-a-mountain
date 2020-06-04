import setOpacityForAll from "./setOpacityForAll.js";

export default (meshGroup, opacity) => {
  if (meshGroup.length > 0) {
    setOpacityForAll(meshGroup, opacity);
  } else {
    if (meshGroup.material) {
      meshGroup.material.opacity = opacity;
      meshGroup.material.transparent = opacity < 1;
    }
    meshGroup.children.forEach((mesh) => {
      mesh.material.opacity = opacity;
      mesh.material.transparent = opacity < 1;
    });
  }
};