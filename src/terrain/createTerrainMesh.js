export const MAX_QUAD_X = 100;
export const MAX_QUAD_Z = 100;

const calculateBufferIndex = (maxQuadZ, xIndex, zIndex) => maxQuadZ * xIndex + zIndex + xIndex;

const createFace = (index1, index2, index3, colors) => {
  return new THREE.Face3(index1, index2, index3, null, [colors[index1], colors[index2], colors[index3]])
};

const createFaces = (maxQuadZ, colors) => {
  const faces = [];
  for (let xIndex = 0; xIndex < MAX_QUAD_X; xIndex++) {
    for (let zIndex = 0; zIndex < maxQuadZ; zIndex++) {
      const bufferIndex = calculateBufferIndex(maxQuadZ, xIndex, zIndex);
      faces.push(
        createFace(bufferIndex, bufferIndex + 1, bufferIndex + 1 + maxQuadZ, colors),
        createFace(bufferIndex + 1, bufferIndex + 2 + maxQuadZ, bufferIndex + 1 + maxQuadZ, colors)
      );
    }
  }
  return faces;
};

const calculateSlope = (maxQuadZ, vertices, xIndexCenter, zIndexCenter) => {
  const centerHeight = vertices[calculateBufferIndex(maxQuadZ, xIndexCenter, zIndexCenter)].y;
  const slopes = [];
  for (let xIndex = Math.max(0, xIndexCenter - 1); xIndex < Math.min(MAX_QUAD_X, xIndexCenter + 2); xIndex++) {
    for (let zIndex = Math.max(0, zIndexCenter - 1); zIndex < Math.min(maxQuadZ, zIndexCenter + 2); zIndex++) {
      slopes.push(Math.abs(centerHeight - vertices[calculateBufferIndex(maxQuadZ, xIndex, zIndex)].y));
    }
  }
  return slopes.reduce((a, b) => a + b, 0) / slopes.length;
};

const calculateColor = (maxQuadZ, maxHeight, vertices) => {
  const snowColor = new THREE.Color(0xf7f7f9);
  const dryColor = new THREE.Color(0xd3d9b3);
  const grassColor = new THREE.Color(0xcad978);
  const rockColor = new THREE.Color(0x888985);
  const availableColors = [
    {minHeight: 0.0, maxHeight: 2.0, minSlope: 0.012, maxSlope: 0.020, color: rockColor},
    {minHeight: 0.1, maxHeight: 0.8, minSlope: 0.000, maxSlope: 0.013, color: dryColor},
    {minHeight: -0.4, maxHeight: 0.6, minSlope: -0.010, maxSlope: 0.008, color: grassColor},
    {minHeight: 0.6, maxHeight: 1.0, minSlope: -0.010, maxSlope: 0.015, color: snowColor},
  ];
  const colors = [];
  for (let xIndex = 0; xIndex <= MAX_QUAD_X; xIndex++) {
    for (let zIndex = 0; zIndex <= maxQuadZ; zIndex++) {
      const relativeHeight = vertices[calculateBufferIndex(maxQuadZ, xIndex, zIndex)].y / maxHeight;
      const slope = calculateSlope(maxQuadZ, vertices, xIndex, zIndex);
      const possibleColors = availableColors.filter(color =>
        relativeHeight >= color.minHeight && relativeHeight <= color.maxHeight && slope >= color.minSlope && slope <= color.maxSlope
      );
      let weightSum = 0;
      const weightedColors = possibleColors.map(color => {
        const heightWeight = Math.min((relativeHeight - color.minHeight), (color.maxHeight - relativeHeight)) * 2 / (color.maxHeight - color.minHeight);
        const slopeWeight = Math.min((slope - color.minSlope), (color.maxSlope - slope)) * 2 / (color.maxSlope - color.minSlope);
        const weight = Math.min(heightWeight, slopeWeight);
        weightSum += weight;
        return {
          color: color.color,
          weight,
          weightSum
        };
      });
      const chosenWeightSum = Math.random() * weightSum;
      const chosenColor = weightedColors.find(color => chosenWeightSum <= color.weightSum);
      colors.push(chosenColor ? chosenColor.color : availableColors[0].color);
    }
  }
  return colors;
};

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
  const colors = calculateColor(maxQuadZ, maxHeight, geometry.vertices);
  geometry.faces = createFaces(maxQuadZ, colors);
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
