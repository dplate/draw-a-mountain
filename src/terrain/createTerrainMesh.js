import createTerrainFaces from './createTerrainFaces.js';

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

const calculateHeight = (ridgeHeight, ridgeSlope, zFactor, lastHeight) => {
  const cosOffset = ridgeSlope;
  const optimalHeight = ridgeHeight * (Math.cos((zFactor * (1 - cosOffset) + cosOffset) * Math.PI) + 1) / 2 / ((Math.cos(cosOffset * Math.PI) + 1) / 2);
  const maxVariance = zFactor < 1 ? ((lastHeight || optimalHeight) - optimalHeight) / 5 : 0;
  const heightVariance = (Math.random() * 2 * maxVariance) - maxVariance;
  return optimalHeight + heightVariance;
};

const calculateX = (maxSkew, xFactor, zFactor) => {
  return xFactor - (1 - 2 * Math.abs(xFactor - 0.5)) * (Math.sin(zFactor * 2 * Math.PI - 1.5) + 1) * maxSkew;
}

const createVertices = (maxQuadZ, ridgeHeights, maxSkew) => {
  const vertices = [];
  for (let xIndex = 0; xIndex <= MAX_QUAD_X; xIndex++) {
    const ridgeSlope = calculateRidgeSlope(ridgeHeights, xIndex);
    let lastHeight = null;
    for (let zIndex = 0; zIndex <= maxQuadZ; zIndex++) {
      const xFactor = xIndex / MAX_QUAD_X;
      const zFactor = zIndex / maxQuadZ;
      const x = calculateX(maxSkew, xFactor, zFactor);
      const y = calculateHeight(ridgeHeights[xIndex], ridgeSlope, zFactor, lastHeight);
      vertices.push(new THREE.Vector3(x, y, 5 * (zFactor - 1)));
      lastHeight = y;
    }
  }
  return vertices;
};

export default (scene, ridgeHeights, maxHeight) => {
  const maxQuadZ = Math.ceil(maxHeight * MAX_QUAD_Z);
  const maxSkew = (Math.random() - 0.5) * 0.08;

  const geometry = new THREE.Geometry();
  geometry.vertices = createVertices(maxQuadZ, ridgeHeights, maxSkew);
  geometry.faces = createTerrainFaces(MAX_QUAD_X, maxQuadZ, maxHeight, geometry.vertices);
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true
    //, wireframe: true
  });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geometry), material);
  geometry.dispose();
  mesh.name = 'terrain';
  scene.add(mesh);
  return mesh;
};
