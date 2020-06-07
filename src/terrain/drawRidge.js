const recreateRidgeMesh = (scene, ridgeMesh, heights) => {
  if (ridgeMesh) {
    ridgeMesh.geometry.dispose();
    ridgeMesh.material.dispose();
    scene.remove(ridgeMesh);
  }

  const geometry = new THREE.Geometry();
  heights.forEach((height, i) => {
    if (height !== null) {
      geometry.vertices.push(new THREE.Vector3(i / (heights.length - 1), height, 0));
    }
  });
  const line = new MeshLine();
  line.setGeometry(geometry);
  const material = new MeshLineMaterial({lineWidth: 0.01});
  const mesh = new THREE.Mesh(line.geometry, material);
  mesh.name = 'ridge';
  scene.add(mesh);
  return mesh;
};

let lastIndex = null;

export default (scene, heights, point, endIt = false) => {
  const endIndex = heights.length - 1;
  const currentIndex = Math.max(0, Math.min(Math.round(point.x * endIndex), endIndex));
  const firstHeight = !heights.find(height => height !== null);
  const newHeight = Math.max(0.03, point.y);

  if (firstHeight) {
    heights.fill(newHeight, 0, heights.length);
  } else {
    heights[currentIndex] = newHeight;
    if (lastIndex) {
      const from = Math.min(lastIndex, currentIndex);
      const to = Math.max(lastIndex, currentIndex);
      for (let i = from + 1; i < to; i++) {
        heights[i] = heights[from] + (i - from) * (heights[to] - heights[from]) / (to - from);

      }
    }
  }

  lastIndex = endIt ? null : currentIndex;

  const ridgeMesh = scene.getObjectByName('ridge');
  return recreateRidgeMesh(scene, ridgeMesh, heights);
};
