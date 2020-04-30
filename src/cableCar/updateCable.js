export default (mesh, curve) => {
  const points = curve.getPoints(curve.getLength() * 20);
  mesh.geometry.setFromPoints(points);
  mesh.visible = true;
};