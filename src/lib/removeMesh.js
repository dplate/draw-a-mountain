export default (scene, mesh) => {
  mesh.geometry.dispose();
  mesh.material.dispose();
  scene.remove(mesh);
};