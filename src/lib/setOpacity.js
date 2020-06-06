export default (mesh, opacity) => {
  if (mesh.material) {
    mesh.material.opacity = opacity;
    mesh.material.transparent = opacity < 1;
  }
};