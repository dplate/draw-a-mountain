const setOpacity = (meshes, opacity) => {
  Object.values(meshes).forEach((meshGroup) => {
    if (meshGroup.length > 0) {
      setOpacity(meshGroup, opacity);
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
  });
};

export default setOpacity;