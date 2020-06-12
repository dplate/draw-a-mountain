const black = new THREE.Color(0x000000);
const green = new THREE.Color(0x0adb00);

const markAsConnected = (node) => {
  node.pointMesh.material.color = green;
  node.connected = true;
  node.paths.forEach((path) => {
    path.nodes
      .filter(neighbourNode => !neighbourNode.connected)
      .forEach(markAsConnected);
  });
};

export default (nodes) => {
  nodes.forEach(node => {
    node.pointMesh.material.color = black;
    node.connected = false;
  });
  markAsConnected(nodes.find(node => node.entrances.find(entrance => entrance.type === 'train')));

  const cableCarNodes = nodes.filter(node => node.entrances.find(entrance => entrance.type === 'cableCar'));
  const notConnectedCableCarNodes = cableCarNodes.filter(node => !node.connected);
  if (notConnectedCableCarNodes.length < cableCarNodes.length) {
    notConnectedCableCarNodes.forEach(markAsConnected);
  }
};