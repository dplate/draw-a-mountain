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
  const snowColor = new THREE.Color(0xf7f7f9);
  const dryColor = new THREE.Color(0xd3d9b3);
  const grassColor = new THREE.Color(0xcad978);
  const rockColor = new THREE.Color(0xb8b8b8);
  const availableColors = [
    {minHeight: 0.0, maxHeight: 2.0, minSlope: 0.010, maxSlope: 0.020, color: rockColor},
    {minHeight: 0.1, maxHeight: 0.8, minSlope: 0.000, maxSlope: 0.013, color: dryColor},
    {minHeight: -0.4, maxHeight: 0.7, minSlope: -0.010, maxSlope: 0.008, color: grassColor},
    {minHeight: 0.7, maxHeight: 1.0, minSlope: -0.010, maxSlope: 0.015, color: snowColor},
  ];
  const colors = [];
  for (let xIndex = 0; xIndex <= maxQuadX; xIndex++) {
    for (let zIndex = 0; zIndex <= maxQuadZ; zIndex++) {
      const relativeHeight = vertices[calculateBufferIndex(maxQuadZ, xIndex, zIndex)].y / maxHeight;
      const slope = calculateSlope(maxQuadX, maxQuadZ, vertices, xIndex, zIndex);
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

export default (maxQuadX, maxQuadZ, maxHeight, vertices) => {
  const colors = calculateColors(maxQuadX, maxQuadZ, maxHeight, vertices);
  return createFaces(maxQuadX, maxQuadZ, colors);
}