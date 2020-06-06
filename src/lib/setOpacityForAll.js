import setOpacity from './setOpacity.js';

export default (meshes, opacity) => {
  Object.values(meshes).forEach(mesh => setOpacity(mesh, opacity));
};
