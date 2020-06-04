const poleMaterial = new MeshLineMaterial({lineWidth: 0.001, color: 0x565453})
const wireMaterial = new THREE.LineBasicMaterial({color: 0x999999});

const buildPole = (scene, bottom, top) => {
  const geometry = new THREE.Geometry();
  geometry.vertices.push(bottom);
  geometry.vertices.push(top);
  const line = new MeshLine();
  line.setGeometry(geometry);
  const pole = new THREE.Mesh(line.geometry, poleMaterial);
  pole.name = 'pole';
  scene.add(pole);
};

export default (scene, start, middle1, middle2, end) => {
  const anchorPoint1 = new THREE.Vector3();
  anchorPoint1.copy(middle1.point);
  anchorPoint1.addScaledVector(middle1.normal, 0.004);
  buildPole(scene, middle1.point, anchorPoint1)

  const anchorPoint2 = new THREE.Vector3();
  anchorPoint2.copy(middle2.point);
  anchorPoint2.addScaledVector(middle2.normal, 0.004);
  buildPole(scene, middle2.point, anchorPoint2)

  const wire = new THREE.Line(new THREE.BufferGeometry(), wireMaterial);
  wire.geometry.setFromPoints([start.point, anchorPoint1, anchorPoint2, end.point]);
  wire.name = 'wire';
  scene.add(wire);
};