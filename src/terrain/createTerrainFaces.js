import selectRandom from '../lib/selectRandom.js';
import availableGrounds from './availableGrounds.js';

const calculateBufferIndex = (maxQuadZ, xIndex, zIndex) => maxQuadZ * xIndex + zIndex + xIndex;

const createFace = (index1, index2, index3, colors) => {
  return new THREE.Face3(index1, index2, index3, null, [colors[index1], colors[index2], colors[index3]])
};

const createFaces = (maxQuadX, maxQuadZ, colors) => {
  const faces = [];
  for (let xIndex = 0; xIndex < maxQuadX; xIndex++) {
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

const calculateSlope = (maxQuadX, maxQuadZ, vertices, xIndexCenter, zIndexCenter) => {
  const centerHeight = vertices[calculateBufferIndex(maxQuadZ, xIndexCenter, zIndexCenter)].y;
  const slopes = [];
  for (let xIndex = Math.max(0, xIndexCenter - 1); xIndex < Math.min(maxQuadX, xIndexCenter + 2); xIndex++) {
    for (let zIndex = Math.max(0, zIndexCenter - 1); zIndex < Math.min(maxQuadZ, zIndexCenter + 2); zIndex++) {
      slopes.push(Math.abs(centerHeight - vertices[calculateBufferIndex(maxQuadZ, xIndex, zIndex)].y));
    }
  }
  return slopes.reduce((a, b) => a + b, 0) / slopes.length;
};

const calculateColors = (maxQuadX, maxQuadZ, maxHeight, vertices) => {
  const colors = [];
  for (let xIndex = 0; xIndex <= maxQuadX; xIndex++) {
    for (let zIndex = 0; zIndex <= maxQuadZ; zIndex++) {
      const height = vertices[calculateBufferIndex(maxQuadZ, xIndex, zIndex)].y / maxHeight;
      const slope = calculateSlope(maxQuadX, maxQuadZ, vertices, xIndex, zIndex);
      const {item: chosenGround} = selectRandom(availableGrounds, height, slope);
      colors.push(chosenGround ? chosenGround.color : availableGrounds[0].color);
    }
  }
  return colors;
};

export default (maxQuadX, maxQuadZ, maxHeight, vertices) => {
  const colors = calculateColors(maxQuadX, maxQuadZ, maxHeight, vertices);
  return createFaces(maxQuadX, maxQuadZ, colors);
}