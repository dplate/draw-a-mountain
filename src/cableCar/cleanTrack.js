export default (terrain, trees, primaryCable) => {
  for (let factor = 0; factor <= 1.0; factor += 0.01) {
    const point = primaryCable.userData.curve.getPoint(factor);
    const { point: terrainPoint } = terrain.getTerrainInfoAtPoint(point, true);
    const heightDiff = point.y - terrainPoint.y;
    if (heightDiff < 0.06) {
      trees.fellTrees(terrainPoint);
    }
  }
};