export default (meshes, opacity) => {
  meshes.forEach((meshGroup) => {
    meshGroup.children.forEach((mesh) => {
      mesh.material.opacity = opacity;
      mesh.material.transparent = opacity < 1;
    })
  });
};