import removeMesh from '../lib/removeMesh.js';

export default (scene, person) => {
  Object.values(person).forEach((attribute) => {
    if (attribute && attribute.meshes) {
      Object.values(attribute.meshes).forEach((mesh) => {
        removeMesh(scene, mesh);
      });
    }
  });
};