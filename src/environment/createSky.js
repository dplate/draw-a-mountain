export default (scene) => {
  const mistColor = new THREE.Color(0xb4daf1);
  const skyColor = new THREE.Color(0x027fbe);

  const geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3(0, 0, -10),
    new THREE.Vector3(1, 0, -10),
    new THREE.Vector3(0, 1, -10),
    new THREE.Vector3(1, 1, -10)
  );

  geometry.faces.push(new THREE.Face3(0, 1, 2, null, [mistColor, mistColor, skyColor]));
  geometry.faces.push(new THREE.Face3(2, 1, 3, null, [skyColor, mistColor, skyColor]));

  const material = new THREE.MeshBasicMaterial({vertexColors: true});
  material.fog = false;
  scene.add(new THREE.Mesh(geometry, material));
};