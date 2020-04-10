import drawRidge from "./drawRidge.js";
import createTerrainMesh, {MAX_QUAD_X} from "./createTerrainMesh.js";
import createRocks from "./createRocks.js";

export default (scene) => {
  const ridgeHeights = Array(MAX_QUAD_X + 1).fill(null);
  let ridgeMesh = null;
  let terrainMesh = null;
  let terrainGrowthProgress = 0;
  let rockGrowthProgress = 0;
  let growRocks = null;

  return {
    onTouchStart: ({point}) => {
      if (!ridgeMesh) {
        drawRidge(scene, ridgeHeights, point)
      }
    },
    onTouchMove: ({point}) => {
      if (!ridgeMesh) {
        drawRidge(scene, ridgeHeights, point)
      }
    },
    onTouchEnd: ({point}) => {
      if (!ridgeMesh) {
        ridgeMesh = drawRidge(scene, ridgeHeights, point, true);
        terrainMesh = createTerrainMesh(scene, ridgeHeights);

      }
    },
    onAnimate: async ({elapsedTime}) => {
      if (terrainMesh) {
        if (terrainGrowthProgress <= 1) {
          terrainMesh.scale.y = 0.5 * Math.sin(Math.PI * (terrainGrowthProgress - 0.5)) + 0.5;
          terrainGrowthProgress += elapsedTime / 2000;
        } else if (ridgeMesh) {
          ridgeMesh.geometry.dispose();
          ridgeMesh.material.dispose();
          scene.remove(ridgeMesh);
          ridgeMesh = null;
          growRocks = await createRocks(scene, terrainMesh);
        } else if (rockGrowthProgress <= 1 && growRocks) {
          const rockSize = 0.5 * Math.sin(Math.PI * (rockGrowthProgress - 0.5)) + 0.5;
          rockGrowthProgress += elapsedTime / 2000;
          growRocks(rockSize);
        }
      }
    }
  }
};