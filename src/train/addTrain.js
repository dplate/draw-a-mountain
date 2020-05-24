export default async (scene) => {
  const geometry = new THREE.PlaneGeometry(1, 0.01);
  geometry.translate(0.5, -0.005, -0.0001);
  const material = new THREE.MeshBasicMaterial({color: 0xc4d779, side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  return {
    entrances: [{
      terrainInfo: {
        point: new THREE.Vector3(0.9, 0, 0),
        normal: new THREE.Vector3(0, 1, 0),
        slope: 0,
        height: 0
      },
      exit: true
    }]
  };
};