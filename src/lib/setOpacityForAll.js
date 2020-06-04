import setOpacity from "./setOpacity.js";

export default (meshes, opacity) => {
  Object.values(meshes).forEach(meshGroup => setOpacity(meshGroup, opacity));
};
