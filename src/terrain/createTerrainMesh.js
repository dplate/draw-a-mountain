import createTerrainFaces from "./createTerrainFaces.js";

export const MAX_QUAD_X = 100;
export const MAX_QUAD_Z = 100;

const calculateWeightedDiffAverage = (heights) => {
  const weights = [1.0, 0.8, 0.5, 0.2, 0.1];
  const accumulation = heights.reduce(
    (acc, height, i) => {
      if (i >= heights.length - 1) {
        return acc;
      }
      const diff = Math.abs(height - heights[i + 1]);
      return {sum: acc.sum + diff * weights[i], sumWeights: acc.sumWeights + weights[i]};
    },
    {sum: 0, sumWeights: 0}
  );
  return accumulation.sumWeights > 0 ? accumulation.sum / accumulation.sumWeights : 0;
};

const calculateRidgeSlope = (ridgeHeights, xIndex) => {
  const leftHeights = ridgeHeights.slice(Math.max(0, xIndex - 5), xIndex + 1).reverse();
  const rightHeights = ridgeHeights.slice(xIndex, xIndex + 6);
  const averageDiff = (calculateWeightedDiffAverage(leftHeights) + calculateWeightedDiffAverage(rightHeights)) / 2;
  return Math.sqrt(averageDiff);
};

const calculateHeight = (ridgeHeight, ridgeSlope, zFactor) => {
  const cosOffset = ridgeSlope;
  return ridgeHeight * (Math.cos((zFactor * (1 - cosOffset) + cosOffset) * Math.PI) + 1) / 2 / ((Math.cos(cosOffset * Math.PI) + 1) / 2);
};

const createVertices = (maxQuadZ, ridgeHeights) => {
  const vertices = [];
  for (let xIndex = 0; xIndex <= MAX_QUAD_X; xIndex++) {
    const ridgeSlope = calculateRidgeSlope(ridgeHeights, xIndex);
    for (let zIndex = 0; zIndex <= maxQuadZ; zIndex++) {
      const zFactor = zIndex / (maxQuadZ + 1);
      const y = calculateHeight(ridgeHeights[xIndex], ridgeSlope, zFactor);
      vertices.push(new THREE.Vector3(xIndex / MAX_QUAD_X, y, 5 * (zFactor - 1)));
    }
  }
  return vertices;
};

export default (scene, ridgeHeights) => {
  const maxHeight = ridgeHeights.reduce((a, b) => Math.max(a, b), 0);
  const maxQuadZ = Math.ceil(maxHeight * MAX_QUAD_Z);

  const geometry = new THREE.Geometry();
  geometry.vertices = createVertices(maxQuadZ, ridgeHeights);
  geometry.faces = createTerrainFaces(MAX_QUAD_X, maxQuadZ, maxHeight, geometry.vertices);
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true
    //, wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
};
