import loadSvg from "../lib/loadSvg.js";

export default async (scene) => {
  const mesh = await loadSvg('cloud-1');
  mesh.translateX(0.3);
  mesh.translateY(0.3);
  mesh.scale.x = 0.1;
  mesh.scale.y = 0.1;

  scene.add(mesh);
};