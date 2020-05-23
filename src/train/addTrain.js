export default async () => {
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