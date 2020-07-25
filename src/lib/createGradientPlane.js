export default (bottomColor, topColor, left, right, bottom, top, z) => {
  const geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(left, bottom, z),
    new THREE.Vector3(right, bottom, z),
    new THREE.Vector3(left, top, z),
    new THREE.Vector3(right, top, z)
  );

  geometry.faces.push(new THREE.Face3(0, 1, 2, null, [bottomColor, bottomColor, topColor]));
  geometry.faces.push(new THREE.Face3(2, 1, 3, null, [topColor, bottomColor, topColor]));

  const material = new THREE.MeshBasicMaterial({vertexColors: true});
  const mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geometry), material);
  geometry.dispose();

  return mesh;
};