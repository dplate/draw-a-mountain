export default (scene, meshGroup) => {
  if (meshGroup.geometry) {
    meshGroup.geometry.dispose()
  }
  if (meshGroup.material) {
    meshGroup.material.dispose()
  }
  meshGroup.children.forEach((mesh) => {
    mesh.geometry.dispose()
    mesh.material.dispose();
  });
  scene.remove(meshGroup);
};