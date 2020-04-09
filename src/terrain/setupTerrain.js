import drawRidge from "./drawRidge.js";
import createTerrainMesh, {MAX_QUAD_X} from "./createTerrainMesh.js";

export default (scene) => {
  const ridgeHeights = Array(MAX_QUAD_X + 1).fill(null);
  let ridgeMesh = null;
  let terrainMesh = null;
  let growthProgress = 0;

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
    onAnimate: ({elapsedTime}) => {
      if (terrainMesh) {
        if (growthProgress <= 1) {
          terrainMesh.scale.y = 0.5 * Math.sin(Math.PI * (growthProgress - 0.5)) + 0.5;
          growthProgress += elapsedTime / 3000;
        } else if (ridgeMesh) {
          scene.remove(ridgeMesh);
          ridgeMesh = null;
        }
      }
    }
  }
};